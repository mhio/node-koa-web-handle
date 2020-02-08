const debug = require('debug')('mh:KoaHandle')
const base62 = require('base62-random')
const Promise = require('bluebird')
const { Exception } = require('@mhio/exception')

class KoaHandleException extends Exception {}

class KoaHandle {
  
  static _initialiseClass(){
    this.powers = [ 'Bananas', 'Electrons', 'Lemons', 'DeveloperTears' ]
    const random_power_i = Math.floor(Math.random() * this.powers.length)
    this.power = this.powers[random_power_i]
  }

  /**
   * @summary  Run a promise to return html
   */
  static responseSend( object, method ){
    return Promise.coroutine(function* responseSend( ctx, next ){
      ctx.body = yield object[method](ctx, next) // eslint-disable-line require-atomic-updates
    })
  }

  /**
   * @summary  Run a promise to populate a template
   * @param {object} object       - The object containing the function to call
   * @param {string} method       - The method to call on `object`
   * @param {object} template     - handlebars template 
   */
  static responseTemplate( object, method, template ){
    return Promise.coroutine(function* responseTemplate( ctx, next ){
      let variables = yield object[method](ctx, next)
      debug('responseTemplate about to render vars', variables, template)
      //ctx.body = yield ctx.render(template, variables)  
      // maybe merge state indead?
      ctx.state = variables  // eslint-disable-line require-atomic-updates
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
   * @params {object} options                   - Options
   * @params {string} options.error_template    - The template to use for "not found" 404's
   */
  static notFound(options = {}){
    const error_template = options.error_template || '<notfound/>'
    return function( ctx, next ){ // eslint-disable-line no-unused-vars
      debug('notFound', ctx.request._mh_id, ctx.request.ip, ctx.request.method, ctx.request.url)
      ctx.status = 404
      ctx.body = error_template
    }
  }

  /**
   * @summary  Middleware (early) to start tracking request times and ids
   * @returns Promise<undefined>
   */
  static tracking(){
    const power = this.power
    return Promise.coroutine(function* tracking( ctx, next ){
      const start = Date.now()
      let request_id = base62(18)
      ctx.set('x-request-id', request_id)
      if ( ctx.get('x-transaction-id') === '' ){
        ctx.set('x-transaction-id', request_id)
      } else {
        debug('tracking transaction id attached "%s"', ctx.get('x-transaction-id'))
      }
      ctx.set('x-powered-by', power)
      debug('tracking request', request_id, ctx.ip, ctx.method, ctx.url)
      yield next()
      const ms = Date.now() - start
      ctx.set('x-response-time', `${ms}ms`)
      debug('tracking response', ctx.get('x-request-id'), ms, ctx.url)
    })
  }

  /**
   * @summary  Error middleware
   * @param {object} options                - Options
   * @param {object} options.logger         - Logger instance following pino API
   * @param {object} options.template       - Template to use in production (recieves `message`, `error`, `ctx`)
   * @param {object} options.template_dev   - Dev template to use in !production (recieves `message`, `error`, `ctx`)
   */
  static error(options = {}){
    const loggerObj = options.logger || console
    return Promise.coroutine(function* error(ctx, next){
      try {
        yield next()
      } catch (error) {
        debug('KoaHandle request caught error', error.status, error.message, error)
        if (!error.status) error.status = 500
        if (!error.label)  error.label = 'Request Error'
        // if (!error.simple) error.simple = 'Request Error'
        if (!error.id)     error.id = base62(12)
        loggerObj.error('KoaHandle caught error', error)
        let message = error.simple || 'The request failed'
        ctx.status = error.status
        if (process.env.NODE_ENV === 'production') {
          ctx.body = `<gahh><h3>Error</h3><p>${message}</p><p>ID: ${error.id}</p></gahh>`
        } else {
          ctx.body = `<gahh><h3>Error</h3><p>${message}</p><pre>${JSON.stringify(error, undefined, 2)}</pre></gahh>`
        }
      }
    })
  }


}
KoaHandle._initialiseClass()
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
module.exports = {
  KoaHandle,
  KoaHandleException,
  Exception,
}
