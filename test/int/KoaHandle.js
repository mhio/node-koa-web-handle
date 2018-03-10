/* global expect */
const supertest = require('supertest')
const http = require('http')
const Koa = require('koa')
const { Exception } = require('@mhio/exception')

const { KoaHandle } = require('../../src/KoaHandle')


describe('mh::int::KoaHandle', function(){

  let app = null
  let server = null
  let request

  beforeEach(function(done){
    app = new Koa()
    server = http.createServer(app.callback()).listen(done)
    request = supertest(server)
  })

  afterEach(function(done){
    server.close(done)
  })

  it('should generate a koa response', async function(){
    let o = { ok: ()=> Promise.resolve('ok') }
    app.use(KoaApiHandle.response(o, 'ok'))
    let res = await request.get('/ok')
    expect( res.status ).to.equal(200)
    expect( res.body ).to.have.property('data').and.equal('ok')
  })

  it('should generate a koa notFound response', async function(){
    app.use(KoaApiHandle.notFound())
    let res = await request.get('/nonono')
    expect( res.status ).to.equal(404)
    expect( res.body ).to.containSubset({ error: { label: 'Not Found', details: '/nonono' }})
  })

  it('should handle a koa error', async function(){
    //app.on('error', KoaApiHandle.error())
    app.use(KoaApiHandle.error())
    app.use(ctx => {
      if ( ctx.request.url === '/error' ) throw new Error('error')
    })
    let res = await request.get('/error')
    expect( res.status ).to.equal(500)
    expect( res.body ).to.containSubset({ error: { label: 'Request Error' }})
  })

  it('should handle a koa Exception', async function(){
    //app.on('error', KoaApiHandle.error())
    app.use(KoaApiHandle.error())
    app.use(ctx => {
      if ( ctx.request.url === '/error' ) throw new Exception('oh no error', { simple: 'error'} )
    })
    let res = await request.get('/error')
    expect( res.status ).to.equal(500)
    expect( res.body ).to.containSubset({
      error: { 
        label: 'Request Error',
        message: 'oh no error',
        name: 'Exception'
      }
    })
  })

})
