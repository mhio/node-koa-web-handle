/* global expect */

const { KoaWebHandle } = require('../../')

describe('mh::test::built::module', function(){

  it('should load the KoaWebHandle', function(){
    expect( KoaWebHandle, 'KoaWebHandle module' ).to.be.ok
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

})
