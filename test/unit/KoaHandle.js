/* global expect */

const { KoaHandle } = require('../../src/KoaHandle')

describe('mh::unit::KoaHandle', function(){

  it('should load KoaApiHandle', function(){
    expect( KoaApiHandle ).to.be.ok    
  })
  
  it('should not create a KoaApiHandle', function(){
    let fn = () => new KoaApiHandle()
    expect( fn ).to.throw('No class')
  })

  it('should return a response function', function(){
    expect( KoaApiHandle.response() ).to.be.a('function')
  })

  it('should return a notFound function', function(){
    expect( KoaApiHandle.notFound() ).to.be.a('function')
  })

  it('should return an error function', function(){
    expect( KoaApiHandle.error() ).to.be.a('function')
  })

})
