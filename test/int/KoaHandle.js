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

  xit('should debug a koa template response', async function(){
    let koa_views = require('koa-views')(__dirname+'/../fixture/views', {
      extension: 'hbs',
      map: { hbs: 'handlebars' }
    })
    app.use(koa_views)
    app.use((ctx) => {
        ctx.state = { say: 'ok' }
        return ctx.render('testview.hbs')
    })
    let res = await request.get('/ok')
    expect( res.text ).to.have.equal('template says "ok"')
    expect( res.status ).to.equal(200)
  })

  it('should send a koa template response for mustache', async function(){
    let koa_views = require('koa-views')(__dirname+'/../fixture/views', {
      extension: 'ms',
      map: { hbs: 'mustache' }
    })
    app.use(koa_views)
    let o = { ok: ()=> Promise.resolve({ say: 'ok' }) }
    app.use(KoaHandle.response(o, 'ok', { template: 'testview.hbs' }))
    let res = await request.get('/ok')
    expect( res.text ).to.have.equal('template says "ok"')
    expect( res.status ).to.equal(200)
  })

  it('should send a koa template response handlebars', async function(){
    let koa_views = require('koa-views')(__dirname+'/../fixture/views', {
      extension: 'hbs',
      map: { hbs: 'handlebars' }
    })
    app.use(koa_views)
    let o = { ok: ()=> Promise.resolve({ say: 'ok' }) }
    app.use(KoaHandle.response(o, 'ok', { template: 'testview.hbs' }))
    let res = await request.get('/ok')
    expect( res.text ).to.have.equal('template says "ok"')
    expect( res.status ).to.equal(200)
  })

  it('should generate a koa notFound response', async function(){
    app.use(KoaHandle.notFound())
    let res = await request.get('/nonono')
    expect( res.text ).to.eql('<notfound/>')
    expect( res.status ).to.equal(404)
  })

  it('should handle a koa error', async function(){
    //app.on('error', KoaHandle.error())
    app.use(KoaHandle.error())
    app.use(ctx => {
      if ( ctx.request.url === '/error' ) throw new Error('errormsg')
    })
    let res = await request.get('/error')
    expect( res.text ).to.match(/<gahh><p>Request Error<\/p><p>[0-9a-zA-z]+<\/p><\/gahh>/)
    expect( res.status ).to.equal(500)
  })

  it('should handle a koa Exception', async function(){
    //app.on('error', KoaHandle.error())
    app.use(KoaHandle.error())
    app.use(ctx => {
      if ( ctx.request.url === '/error' ) throw new Exception('oh no error', { simple: 'oh simple error'} )
    })
    let res = await request.get('/error')
    expect( res.text ).to.match(/<gahh><p>oh simple error<\/p><p>[0-9a-zA-z]+<\/p><\/gahh>/)
    expect( res.status ).to.equal(500)
  })

})
