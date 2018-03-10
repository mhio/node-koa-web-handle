/* global expect */

const { KoaHandle } = require('../../src/KoaHandle')

describe('mh::unit::KoaHandle', function(){

  it('should load KoaHandle', function(){
    expect( KoaHandle ).to.be.ok    
  })

  it('should return a responseSend function', function(){
    expect( KoaHandle.responseSend() ).to.be.a('function')
  })

  it('should return a responseTemplate function', function(){
    expect( KoaHandle.responseTemplate() ).to.be.a('function')
  })

  it('should return a response function', function(){
    expect( KoaHandle.response() ).to.be.a('function')
  })

  it('should return a tracking function', function(){
    expect( KoaHandle.tracking() ).to.be.a('function')
  })

  it('should return a error function', function(){
    expect( KoaHandle.error() ).to.be.a('function')
  })

})