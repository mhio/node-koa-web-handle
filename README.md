@mhio/koa-api-handle
--------------------

A Koa API Handler to do all the request heavy lifting, so you just write logic


## Install

```
yarn add @mhio/koa-api-handle
npm install @mhio/koa-api-handle
```

## Usage

[API docs](doc/API.md)

```
const Koa = require('koa')
const Router = require('koa-router')
const KoaApiHandle = require('@mhio/koa-api-handle')

let handler = {
  ok: ()=> Promise.resolve('ok'),
  other: ()=> Promise.resolve('other'),
  error: ()=> Promise.reject(new Error('nope')),
}

const app = new Koa()
const router = new Router()

app.use(KoaApiHandle.error())

router.get('/ok', KoaApiHandle.response(handler, 'ok'))
router.post('/other', KoaApiHandle.response(handler, 'other'))
router.get('/error', KoaApiHandle.response(handler, 'error'))

app.use(router.routes()).user(router.allowedMethods())

app.use(KoaApiHandle.notFound())

app.listen()
```
