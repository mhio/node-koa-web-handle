const debug = require('debug')('mh:KoaHandle')
const base62 = require('base62-random')
const Promise = require('bluebird')
const sample = require('lodash/sample')

class KoaHandleException extends Error {}

class KoaHandle {
  
  static _classInit(){
    this.powers = [ 'Bananas', 'Electrons', 'Lemons', 'DeveloperTears' ]
  }

  /**
   * @summary  Run a promise to return html
  */
  static responseSend( object, method ){
    return Promise.coroutine(function* responseSend( ctx, next ){
      ctx.body = yield object[method](ctx, next)
    })
  }

  /**
   * @summary  Run a promise to populate a template
  */
  static responseTemplate( object, method, template ){
    return Promise.coroutine(function* responseTemplate( ctx, next ){
      let variables = yield object[method](ctx, next)
      debug('about to render vars', variables, template)
      //ctx.body = yield ctx.render(template, variables)  
      ctx.state = variables // maybe merge this?
      return ctx.render(template)  
    })
  }

  /**
   * @summary  Handle the response with either a template or straight response
   */
  static response( object, method, options = {} ){
    if ( options.template ) return this.responseTemplate(object, method, options.template)
    return this.responseSend(object, method)
  }

  /**
   * @summary  404 middleware, after routes
   */
  static notFound(){
    return function( ctx, next ){ // eslint-disable-line no-unused-vars
      debug('notFound', ctx.request._mh_id, ctx.request.ip, ctx.request.method, ctx.request.url)
      ctx.status = 404
      ctx.body = '<notfound/>'
    }
  }

  /**
   * @summary  Middleware (early) to start tracking request times and ids
   * 
  */
  static tracking(){
    let self = this
    return Promise.coroutine(function* tracking( ctx, next ){
      const start = Date.now()
      let request_id = base62(18)
      ctx.set('x-request-id', request_id)
      if ( ctx.get('x-transaction-id') === '' ){
        ctx.set('x-transaction-id', request_id)
      } else {
        debug('transaction id attached "%s"', ctx.get('x-transaction-id'))
      }
      ctx.set('x-powered-by', sample(self.powers))
      debug('request', request_id, ctx.ip, ctx.method, ctx.url)
      yield next()
      const ms = Date.now() - start
      ctx.set('x-response-time', `${ms}ms`)
      debug('response', ctx.get('x-request-id'), ms, ctx.url)
    })
  }

  /**
   * @summary  Error middleware
   */
  static error(){
    return Promise.coroutine(function* error(ctx, next){
      try {
        yield next()
      } catch (error) {
        debug('request caught error', error.status, error.message, error)
        if ( process.env.NODE_ENV === 'production' ) delete error.stack
        if (!error.status) error.status = 500
        if (!error.label)  error.label = 'Request Error'
        if (!error.simple) error.simple = 'Request Error'
        if (!error.id)     error.id = base62(12)
        let message = error.simple || error.message
        ctx.status = error.status
        ctx.body = `<gahh><p>${message}</p><p>${error.id}</p></gahh>`
      }
    })
  }


}
KoaHandle._classInit()
/*
KoaHandle.tracking = function* tracking( ctx, next ){
  const start = Date.now()
  ctx.set('X-Request-Id', base62(16))
  if ( ctx.get('X-Transaction-Id') === undefined ){
    ctx.set('X-Transaction-Id', ctx.get('X-Request-Id'))
  } else {
    debug('transaction id attached', ctx.get('X-Transaction-Id'))
  }
  ctx.set('x-powered-by', 'Lemons')
  await next()
  const ms = Date.now() - start
  ctx.set('x-response-time', `${ms}ms`)
}
*/
module.exports = { KoaHandle, KoaHandleException }
