const fs = require('fs')
const path = require('path')
const cons = require('consolidate')
const { KoaGenericHandle } = require('@mhio/koa-generic-handle')
const { getRandomBase62String } = KoaGenericHandle

const debug = require('debug')('mh:KoaWebHandle')

class KoaWebHandle extends KoaGenericHandle {
  
  static _initialiseClass(){
    this.views_path = null
    this.views_engine = null
    this.views_extension = null
  }

  /**
   * Setup view engine and path. Effect any instances of KoaWebHandle as we don't have a constructor yet
   */
  static views({ engine, path: views_path, extension }){
    if (extension) {
      if (!extension.replace) throw new Error(`Extension doesn't appear to be a string [${extension}]`)
      this.views_extension = extension.replace(/^\./, '')
    }
    if (engine){ 
      if (!cons[engine]) throw new Error(`No template engine [${engine}] available in consolidate`)
      this.views_engine = engine
    }
    if (views_path) {
      if (!pathExists(views_path)) throw new Error(`No path exists [${views_path}] to lookup templates`)
      this.views_path = views_path
    }
  }
 
  /**
   * @summary  Run a promise to return html
   */
  static responseSend( responseFn ){
    if (!responseFn){
      throw new Error('responseSend handler requires an argument')
    }
    if (typeof responseFn !== 'function'){
      throw new Error('responseSend handler requires a function argument')
    }
    return async function koaWebHandleResponseSend(ctx,next){
      ctx.body = await responseFn(ctx, next) // eslint-disable-line require-atomic-updates
    }
  }

  /**
   * @summary  Run a promise to return html
   */
  static responseSendBind( object, method ){
    if (!object) {
      throw new Error('responseSendBind handler requires an argument')
    }
    if (!method) {
      throw new Error('responseSendBind handler requires a function argument')
    }
    if (object && method && typeof object[method] !== 'function') {
      throw new Error('responseSendBind handler requires a function')
    }
    return this.responseSend(object[method].bind(object))
  }

  /**
   * @summary  Run a promise to populate a template
   * @param {object} object       - The object containing the function to call
   * @param {string} method       - The method to call on `object`
   * @param {object} template     - handlebars template 
   */
  static responseTemplate( responseFn, template, engine_override ){
    // Do we add an extension?
    const template_with_ext = (this.views_extension)
      ? `${template}.${this.views_extension}`
      : template
    // Do we lookup a path?
    const template_path = (this.views_path)
      ? path.join(this.views_path, template_with_ext)
      : template_with_ext
    // Do we have an file on disk?
    const template_file_exists = pathExists(template_path)
    if (!template || !template_file_exists) {
      if (!this.views_path) throw new Error(`No views path has been set on KoaWebHandle to find [${template}]`)
      throw new Error(`Couldn't find template [${template}] in [${this.views_path}]`)
    }
    // What template engine are we using for this view?
    if (!engine_override && !this.views_engine) {
      throw new Error('No views engine has been set on KoaWebHandle')
    }
    const engine = engine_override || this.views_engine

    // Now we can create the actual handler function
    return async function koaWebHandleResponseTemplate(ctx,next){
      const variables = await responseFn(ctx, next)
      debug('responseTemplate about to render vars', variables, template_path, engine)
      //ctx.body = yield ctx.render(template, variables)  
      // maybe merge state indead?
      ctx.state = variables  // eslint-disable-line require-atomic-updates
      const res = await cons[engine](template_path, variables)
      debug('responseTemplate res',res)
      ctx.body = res
    }
  }

  /**
   * @summary  Run a promise to return html
   */
  static responseTemplateBind( object, method, template, options ){
    if (!object) {
      throw new Error('responseTemplateBind handler requires an argument')
    }
    if (!method) {
      throw new Error('responseTemplateBind handler requires a method argument')
    }
    if (object && method && typeof object[method] !== 'function') {
      throw new Error('responseTemplateBind handler requires a function')
    }
    return this.responseTemplate(object[method].bind(object), template, options)
  }

  /**
   * @summary  Handle the response with either a template or straight response
   */
  static response( responsefn, options ){
    if ( options && options.template ) return this.responseTemplate(responsefn, options.template, options.engine)
    return this.responseSend(responsefn)
  }

  /**
   * @summary  Handle the response with either a template or straight response
   */
  static responseBind( object, method, options ){
    if (!object) {
      throw new Error('responseTemplateBind handler requires an argument')
    }
    if (!method) {
      throw new Error('responseTemplateBind handler requires a method argument')
    }
    const responsefn = object[method].bind(object)
    return this.response(responsefn, options)
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
   * 
   * @param {object} options 
   * @param {object} options.logger         - Logger instance following pino API
   * @return {object}                       - Pinoish logger object
   */
  static setOptionsLogger(options){
    if ( options.logger === false ) return { error: function(){} }
    if ( options.logger ) return options.logger
    return console
  }

  /**
   * @summary  Error middleware
   * @param {object} options                - Options
   * @param {object} options.logger         - Logger instance following pino API
   * @param {object} options.template       - Template to use in production (recieves `message`, `error`, `ctx`)
   * @param {object} options.template_dev   - Dev template to use in !production (recieves `message`, `error`, `ctx`)
   */
  static errors(options = {}){
    const loggerObj = this.setOptionsLogger(options)
    const error_template = options.error_template
    const error_template_development = options.error_template_development 
    return async function error(ctx, next){
      try {
        await next()
      } catch (error) {
        debug('KoaWebHandle request caught error', error.status, error.message, error)
        if (!error.status) error.status = 500
        if (!error.label)  error.label = 'Request Error'
        // if (!error.simple) error.simple = 'Request Error'
        if (!error.id)     error.id = getRandomBase62String(12)
        loggerObj.error('KoaWebHandle caught error', error)
        let message = error.simple || 'The request failed'
        ctx.status = error.status
        if (process.env.NODE_ENV === 'production') {
          ctx.body = error_template && error_template({ message, error, ctx })
            || `<gahh><h3>Error</h3><p>${message}</p><p>ID: ${error.id}</p></gahh>`
        } else {
          ctx.body = error_template_development && error_template_development({ message, error, ctx })
            || `<gahh><h3>Error</h3><p>${message}</p><pre>${JSON.stringify(error, undefined, 2)}</pre></gahh>`
        }
      }
    }
  }

}
KoaWebHandle._initialiseClass()

function pathExists(test_path){
  try {
    fs.statSync(test_path)
    return true
  } 
  catch (err) {
    if (err.code !== 'ENOENT') throw err
    return false
  }
}

module.exports = {
  KoaWebHandle,
  pathExists,
}
