@mhio/koa-handle
--------------------

A Koa Handlers to do all the heavy lifting, so you just write logic


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
const KoaHandle = require('@mhio/koa-handle')

let handler = {
  ok: ()=> Promise.resolve('ok'),
  other: ()=> Promise.resolve('other'),
  error: ()=> Promise.reject(new Error('nope')),
}

const app = new Koa()
const router = new Router()

app.use(KoaHandle.tracking())
app.use(KoaHandle.error())

router.get('/ok', KoaHandle.response(handler, 'ok'))
router.post('/other', KoaHandle.response(handler, 'other'))
router.get('/error', KoaHandle.response(handler, 'error'))

app.use(router.routes()).user(router.allowedMethods())

app.use(KoaHandle.notFound())

app.listen()
```
