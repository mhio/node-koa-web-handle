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

  it('should send a koa response', async function(){
    let o = { ok: ()=> Promise.resolve('ok') }
    app.use(KoaHandle.response(o, 'ok'))
    let res = await request.get('/ok')
    expect( res.text ).to.have.equal('ok')
    expect( res.status ).to.equal(200)
  })

  it('should send a koa template response', async function(){
    let koa_views = require('koa-views')(__dirname+'/../fixture/views', {
      extension: 'ms',
      map: { ms: 'mustache' }
    })
    app.use(koa_views)
    let o = { ok: ()=> Promise.resolve({ say: 'ok' }) }
    app.use(KoaHandle.response(o, 'ok', { template: 'testview.ms' }))
    let res = await request.get('/ok')
    expect( res.text ).to.have.equal('template says: ok')
    expect( res.status ).to.equal(200)
  })

  it('should generate a koa notFound response', async function(){
    app.use(KoaHandle.notFound())
    let res = await request.get('/nonono')
    expect( res.body ).to.containSubset({ error: { label: 'Not Found', details: '/nonono' }})
    expect( res.status ).to.equal(404)
  })

  it('should handle a koa error', async function(){
    //app.on('error', KoaHandle.error())
    app.use(KoaHandle.error())
    app.use(ctx => {
      if ( ctx.request.url === '/error' ) throw new Error('error')
    })
    let res = await request.get('/error')
    expect( res.body ).to.containSubset({ error: { label: 'Request Error' }})
    expect( res.status ).to.equal(500)
  })

  it('should handle a koa Exception', async function(){
    //app.on('error', KoaHandle.error())
    app.use(KoaHandle.error())
    app.use(ctx => {
      if ( ctx.request.url === '/error' ) throw new Exception('oh no error', { simple: 'error'} )
    })
    let res = await request.get('/error')
    expect( res.body ).to.containSubset({
      error: { 
        label: 'Request Error',
        message: 'oh no error',
        name: 'Exception'
      }
    })
    expect( res.status ).to.equal(500)
  })

})
