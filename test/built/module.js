/* global expect */

const { KoaHandle, KoaHandleException } = require('../../')

describe('mh::test::built::module', function(){

  it('should load the KoaHandle', function(){
    expect( KoaHandle, 'KoaHandle module' ).to.be.ok
  })

  it('should load KoaHandleException', function(){
    expect( KoaHandleException, 'KoaHandleException module' ).to.be.ok
  })

})
