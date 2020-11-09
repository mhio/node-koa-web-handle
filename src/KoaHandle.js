const fs = require('fs')
const path = require('path')
const cons = require('consolidate')
const { KoaGenericHandle } = require('@mhio/koa-generic-handle')

const debug = require('debug')('mh:KoaWebHandle')

class KoaWebHandle extends KoaGenericHandle {
  
  static _initialiseClass(){
    this.views_path = null
    this.views_engine = null
    this.views_extension = null
  }

  /**
   * Setup view engine and path. Effect any instances of KoaHandle as we don't have a constructor yet
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
  static responseSend( object, method ){
    return async function(ctx,next){
      ctx.body = await object[method](ctx, next) // eslint-disable-line require-atomic-updates
    }
  }

  /**
   * @summary  Run a promise to populate a template
   * @param {object} object       - The object containing the function to call
   * @param {string} method       - The method to call on `object`
   * @param {object} template     - handlebars template 
   */
  static responseTemplate( object, method, template, engine_override ){
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
      if (!this.views_path) throw new Error(`No views path has been set on KoaHandle to find [${template}]`)
      throw new Error(`Couldn't find template [${template}] in [${this.views_path}]`)
    }
    // What template engine are we using for this view?
    if (!engine_override && !this.views_engine) {
      throw new Error('No views engine has been set on KoaHandle')
    }
    const engine = engine_override || this.views_engine

    // Now we can create the actual handler function
    return async function(ctx,next){
      const variables = await object[method](ctx, next)
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
   * @summary  Handle the response with either a template or straight response
   */
  static response( object, method, options ){
    if ( options && options.template ) return this.responseTemplate(object, method, options.template, options.engine)
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
  Exception,
  pathExists,
}
