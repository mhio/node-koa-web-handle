/* global expect */

const { KoaWebHandle } = require('../../src/KoaWebHandle')
const noop = function(){}
const o = { noop, bad: 'a' }

describe('mh::unit::KoaWebHandle', function(){

  it('should load KoaWebHandle', function(){
    expect( KoaWebHandle ).to.be.ok    
  })

  it('should return a responseSend function', function(){
    expect( KoaWebHandle.responseSend(noop) ).to.be.a('function')
  })
  it('should fail to return a responseSend function', function(){
    const fn = () => KoaWebHandle.responseSend()
    expect( fn ).to.throw('requires an argument')
  })
  it('should fail to return a responseSend function', function(){
    const fn = () => KoaWebHandle.responseSend('a')
    expect( fn ).to.throw('requires a function')
  })

  it('should return a responseSendBind function', function(){
    expect( KoaWebHandle.responseSendBind(o,'noop') ).to.be.a('function')
  })
  it('should fail to return a responseSendBind function', function(){
    const fn = () => KoaWebHandle.responseSendBind()
    expect( fn ).to.throw('requires an argument')
  })
  it('should fail to return a responseSendBind function', function(){
    const fn = () => KoaWebHandle.responseSendBind(noop)
    expect( fn ).to.throw('requires a function')
  })
  it('should fail to return a responseSendBind function', function(){
    const fn = () => KoaWebHandle.responseSendBind(o,'bad')
    expect( fn ).to.throw('requires a function')
  })

  it('should return a responseTemplate function', function(){
    const template = [__dirname,'..','fixture','views','testview.ms'].join('/')
    expect( KoaWebHandle.responseTemplate(noop, template, 'ejs') ).to.be.a('function')
  })
  it('should return a responseTemplate function', function(){
    const fn = () => KoaWebHandle.responseTemplate(noop, 'nope', 'ejs')
    expect( fn ).to.throw('No view')
  })
  it('should return a responseTemplate function', function(){
    KoaWebHandle.views('whatever')
    const fn = () => KoaWebHandle.responseTemplate(noop, 'nope', 'ejs')
    expect( fn ).to.throw('No view')
    KoaWebHandle._initialiseClass()
  })

  it('should return a response function', function(){
    expect( KoaWebHandle.response(noop) ).to.be.a('function')
  })
  it('should return a response function', function(){
    expect( KoaWebHandle.responseBind(o,'noop') ).to.be.a('function')
  })

  it('should have a tracking function', function(){
    expect( KoaWebHandle.tracking ).to.be.a('function')
  })

  it('should return a tracking function', function(){
    expect( KoaWebHandle.tracking() ).to.be.a('function')
  })

  it('should return a errors function', function(){
    expect( KoaWebHandle.errors() ).to.be.a('function')
  })

})
