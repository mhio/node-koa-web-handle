/* global expect */

const { KoaWebHandle } = require('../../src/KoaWebHandle')

describe('mh::unit::KoaWebHandle', function(){

  it('should load KoaWebHandle', function(){
    expect( KoaWebHandle ).to.be.ok    
  })

  it('should return a responseSend function', function(){
    expect( KoaWebHandle.responseSend() ).to.be.a('function')
  })

  it('should return a responseTemplate function', function(){
    const template = [__dirname,'..','fixture','views','testview.ms'].join('/')
    expect( KoaWebHandle.responseTemplate('a','b',template,'ejs') ).to.be.a('function')
  })

  it('should return a response function', function(){
    expect( KoaWebHandle.response() ).to.be.a('function')
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
