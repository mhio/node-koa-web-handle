/* global expect */

const { KoaWebHandle } = require('../../')
const noop = function(){}

describe('mh::test::built::module', function(){

  it('should load the KoaWebHandle', function(){
    expect( KoaWebHandle, 'KoaWebHandle module' ).to.be.ok
  })

  it('should return a responseSend function', function(){
    expect( KoaWebHandle.responseSend(noop) ).to.be.a('function')
  })

  it('should return a responseTemplate function', function(){
    const template = [__dirname,'..','fixture','views','testview.ms'].join('/')
    expect( KoaWebHandle.responseTemplate(noop,template,'ejs') ).to.be.a('function')
  })

  it('should return a response function', function(){
    expect( KoaWebHandle.response(noop) ).to.be.a('function')
  })

})
