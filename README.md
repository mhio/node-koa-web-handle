@mhio/koa-handle | [git](https://github.com/mhio/node-koa-web-handle) | [npm](https://www.npmjs.com/package/@mhio/koa-web-handle)
--------------------

A Koa Handler to do all the heavy lifting, so you just write logic


## Install

```
yarn add @mhio/koa-web-handle
npm install @mhio/koa-web-handle
```

## Usage

[API docs](doc/API.md)

```
const Koa = require('koa')
const Router = require('koa-router')
const {KoaWebHandle} = require('@mhio/koa-web-handle')

let handler = {
  ok: ()=> Promise.resolve('<ok>ok</ok>'),
  template: ()=> Promise.resolve({ say: 'hello' }),
  error: ()=> Promise.reject(new Error('nope')),
}

const app = new Koa()
const router = new Router()

KoaHandle.views({ path: '../views', engine: 'mustache', extension: 'ms' })
app.use(KoaHandle.tracking()) // first for logging/timings
app.use(KoaHandle.error())

router.get('/ok', KoaHandle.response(handler, 'ok'))
router.post('/rendered', KoaHandle.response(handler, 'other', { template: 'helloer' }))
router.get('/error', KoaHandle.response(handler, 'error'))

app.use(router.routes())
   .use(router.allowedMethods())

app.use(KoaHandle.notFound())

app.listen()
```


## Related

[npm](https://www.npmjs.com/package/@mhio/koa-web-handle)

[@mhio/koa-api](https://www.npmjs.com/package/@mhio/koa-api) /
 [@mhio/koa-api-handle](https://www.npmjs.com/package/@mhio/koa-api-handle)

[@mhio/koa-web](https://www.npmjs.com/package/@mhio/koa-web) /
 [@mhio/koa-web-handle](https://www.npmjs.com/package/@mhio/koa-web-handle)


