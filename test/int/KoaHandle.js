/* global expect */
const path = require('path')
const sinon = require('sinon')
const { Exception } = require('@mhio/exception')

const { koaHandleSetup } = require('../fixture/koaHandleSetup')
const { KoaHandle } = require('../../src/KoaHandle')


describe('mh::int::KoaHandle', function(){

  let t = { app: null, server: null, request: null }

  koaHandleSetup(beforeEach, afterEach, t)

  it('should send a koa response', async function(){
    let handle = { ok: ()=> Promise.resolve('ok') }
    t.app.use(KoaHandle.response(handle, 'ok'))
    t.res = await t.request.get('/ok')
    expect( t.res.text ).to.have.equal('ok')
    expect( t.res.status ).to.equal(200)
  })


  it('should send a koa response', async function(){
    let handle = { ok: ()=> Promise.resolve('ok') }
    t.app.use(KoaHandle.tracking())
    t.app.use(KoaHandle.response(handle, 'ok'))
    t.res = await t.request.get('/ok')
    expect( t.res.text ).to.have.equal('ok')
    expect( t.res.status ).to.equal(200)
    let hdr = t.res.headers
    expect( hdr ).to.have.property('x-powered-by').and.be.oneOf(
      [ 'Bananas', 'Electrons', 'Lemons', 'DeveloperTears' ]
    )
    expect( hdr ).to.have.property('x-transaction-id').and.match(/^[0-9a-zA-Z]+$/)
    expect( hdr ).to.have.property('x-response-time').and.match(/^\d+ms$/)
  })

  xit('should debug a koa template response', async function(){
    t.app.use((ctx) => {
        ctx.state = { say: 'ok' }
        return ctx.render('testview.hbs')
    })
    t.res = await t.request.get('/ok')
    expect( t.res.text ).to.have.equal('template says "ok"')
    expect( t.res.status ).to.equal(200)
  })

  it('should send a koa template response for mustache', async function(){
    let o = { ok: ()=> Promise.resolve({ say: 'ok' }) }
    const template = path.join(__dirname,'..','fixture','views','testview.ms')
    t.app.use(KoaHandle.response(o, 'ok', { template, engine: 'mustache' }))
    t.res = await t.request.get('/ok')
    expect( t.res.text ).to.have.equal('template says "ok"')
    expect( t.res.status ).to.equal(200)
  })

  it('should send a koa template response handlebars', async function(){
    let o = { ok: ()=> Promise.resolve({ say: 'ok' }) }
    const template = path.join(__dirname,'..','fixture','views','testview.hbs')
    t.app.use(KoaHandle.response(o, 'ok', { template, engine: 'handlebars' }))
    t.res = await t.request.get('/ok')
    expect( t.res.text ).to.have.equal('template says "ok"')
    expect( t.res.status ).to.equal(200)
  })

  it('should generate a koa notFound response', async function(){
    t.app.use(KoaHandle.notFound())
    t.res = await t.request.get('/nonono')
    expect( t.res.text ).to.eql('<notfound/>')
    expect( t.res.status ).to.equal(404)
  })

  it('should log a koa error', async function () {
    //app.on('error', KoaHandle.error())
    const errorLogger = sinon.spy()
    t.app.use(KoaHandle.error({ logger: { error: errorLogger } }))
    t.app.use(ctx => {
      if (ctx.request.url === '/error') throw new Error('errormsg')
    })
    t.res = await t.request.get('/error')
    expect(errorLogger.called).to.equal(true)
  })
 
  it('should test a view setup', async function(){
    let o = { ok: ()=> Promise.resolve({ say: 'yabbadabba' }) }
    KoaHandle.views({ engine: 'mustache', path: `${__dirname}/../fixture/views`, extension: 'ms' })
    t.app.use(KoaHandle.responseTemplate(o, 'ok', 'testview'))
    t.res = await t.request.get('/error')
    expect( t.res.text ).to.equal('template says "yabbadabba"')
  })

  describe('NODE_ENV === production', function(){
    let old_process_env_NODE_ENV
    before(function(){
      old_process_env_NODE_ENV = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
    })
    after(function(){
      process.env.NODE_ENV = old_process_env_NODE_ENV
    })

    it('should handle a koa error in production', async function(){
      //app.on('error', KoaHandle.error())
      t.app.use(KoaHandle.error({ logger: { error: function(){} }}))
      t.app.use(ctx => {
        if ( ctx.request.url === '/error' ) throw new Error('errormsg')
      })
      t.res = await t.request.get('/error')
      expect( t.res.text ).to.match(/<gahh><h3>Error<\/h3><p>The request failed<\/p><p>ID: [0-9a-zA-z]+<\/p><\/gahh>/)
      expect( t.res.status ).to.equal(500)
    })

    it('should handle a koa Exception in production', async function () {
      //app.on('error', KoaHandle.error())
      t.app.use(KoaHandle.error({ logger: { error: function () { } } }))
      t.app.use(ctx => {
        if (ctx.request.url === '/error') throw new Exception('oh no error', { simple: 'oh simple error' })
      })
      t.res = await t.request.get('/error')
      expect(t.res.text).to.match(/<gahh><h3>Error<\/h3><p>oh simple error<\/p><p>ID: [0-9a-zA-z]+<\/p><\/gahh>/)
      expect(t.res.status).to.equal(500)
    })

  })
  

})
