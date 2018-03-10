const debug = require('debug')('mh:KoaHandle')
const base62 = require('base62-random')
const Promise = require('bluebird')
const sample = require('lodash/sample')

class KoaHandleError extends Error {}

class KoaHandle {
  
  static get powers(){ return [ 'Bananas', 'Electrons', 'Lemons', 'DeveloperTears' ] }

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
      ctx.body = yield ctx.render(template, variables)  
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
    return function( req, res, next ){ // eslint-disable-line no-unused-vars
      debug('notFound', req._mh_id, req.connection.remoteAddress, req.method, req.url)
      res.status(404).send('<notfound/>')
    }
  }

  /**
   * @summary  Middleware (early) to start tracking request Timestamps and ids
   * 
  */
  static tracking(){
    return Promise.coroutine(function* tracking( ctx, next ){
      const start = Date.now()
      let request_id = base62(18)
      ctx.set('x-request-id', request_id)
      if ( ctx.get('X-Transaction-Id') === '' ){
        ctx.set('X-Transaction-Id', request_id)
      } else {
        debug('transaction id attached "%s"', ctx.get('X-Transaction-Id'))
      }
      ctx.set('X-Powered-By', sample(Handle.powers))
      yield next()
      const ms = Date.now() - start
      ctx.set('X-Response-Time', `${ms}ms`)
      debug('response', ctx.get('X-Request-Id'), ms, ctx.ip, ctx.method, ctx.url)
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
/*
Handle.tracking = function* tracking( ctx, next ){
  const start = Date.now()
  ctx.set('X-Request-Id', base62(16))
  if ( ctx.get('X-Transaction-Id') === undefined ){
    ctx.set('X-Transaction-Id', ctx.get('X-Request-Id'))
  } else {
    debug('transaction id attached', ctx.get('X-Transaction-Id'))
  }
  ctx.set('X-Powered-By', 'Lemons')
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
}
*/
module.exports = { KoaHandle, KoaHandleError }
