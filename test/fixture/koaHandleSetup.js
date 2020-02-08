import supertest from 'supertest'
// import setCookieParser from 'set-cookie-parser'
import Koa from 'koa'
import http from 'http'

// All integration tests need to do this setup
// It's a little messy with the object of vars being passed around
// but it's better than maintaining this in 10 files

//     import { koaHandleSetup } from '../fixture/koaHandleSetup'
//     let t = { request: null, logger: null }
//     koaHandleSetup(beforeEach, afterEach, t)


export const koaBaseCtx = function (ctx_overrides) {
  const base_ctx = {
    is: function () { },
    set: function () { },
    attachment: function () { },
    request: {},
    response: {},
    params: {},
    state: {}, // Normally token goes here
    cookies: {
      set: function(){},
      get: function(){},
    },
  }
  return {
    ...base_ctx,
    ...ctx_overrides
  }
}

/**
 * 
 * @param {function} mochaBeforeFnRef 
 * @param {function} mochaAfterFnRef
 * @param {object} test_obj
 * @param {object.request} test_obj
 * @returns undefined
 */
export const koaHandleSetup = (mochaBeforeFnRef, mochaAfterFnRef, test_obj) => {

  let log_error_store

  mochaBeforeFnRef(function (done) {
    // Inject a logger that matches pino API so we can dump errors after failures
    test_obj.logger = {
      trace(/* ...args */) {
        // debug('trace', ...args)
      }, 
      debug(/* ...args */) {
        // debug('debug', ...args)
      },
      info(/* ...args */) {
        // debug('info', ...args)
      },
      warn(...args) {
        log_error_store.push('warn', ...args)
      },
      error(...args) {
        log_error_store.push('error', ...args)
      },
      fatal(...args) {
        log_error_store.push('fatal', ...args)
      },
    }
    log_error_store = []

    // Setup the server/test instance
    test_obj.app = new Koa()
    test_obj.server = http.createServer(test_obj.app.callback()).listen(done)
    test_obj.request = supertest(test_obj.server)
  })

  mochaAfterFnRef(function (done) {
    if (this.currentTest && this.currentTest.state === 'failed') {
      // Dump errors for failed tests
      if (log_error_store && log_error_store.length && log_error_store.length > 0) {
        console.error('mocha after log_error_store:', log_error_store)
      }
      if (test_obj && test_obj.res) {
        if (test_obj.res.headers) console.error('mocha test failure - response headers:', test_obj.res.headers)
        if (test_obj.res.body) {
          console.error('mocha test failure - response body:', test_obj.res.body)
        } else {
          console.error('mocha test failure - response text:', test_obj.res.text)
        }
      }
    }
    log_error_store = []

    test_obj.server.close(done)
    test_obj.server = null
    
    test_obj.request = null
    test_obj.res = null
    test_obj.app = null
  })

}

