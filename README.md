@mhio/koa-handle
--------------------

A Koa Handler to do all the heavy lifting, so you just write logic


## Install

```
yarn add @mhio/koa-handle
npm install @mhio/koa-handle
```

## Usage

[API docs](doc/API.md)

```
const Koa = require('koa')
const Router = require('koa-router')
const {KoaHandle} = require('@mhio/koa-handle')

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
