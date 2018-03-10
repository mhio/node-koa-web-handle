<a name="KoaApiHandle"></a>

## KoaApiHandle
<p>Handle API requests and errors in Koa apps in a standard way.</p>

**Kind**: global class  

* [KoaApiHandle](#KoaApiHandle)
    * [.response(object, method)](#KoaApiHandle.response)
    * [.notFound()](#KoaApiHandle.notFound)
    * [.error()](#KoaApiHandle.error)


* * *

<a name="KoaApiHandle.response"></a>

### KoaApiHandle.response(object, method)
<p><code>.response</code> can handle all requests that come through Koa. This ensures standard response format and handling. Pass it an object and the method used to handle the reponse</p>

**Kind**: static method of [<code>KoaApiHandle</code>](#KoaApiHandle)  
**Summary**: <p>Default API response handler</p>  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>object</code> | <p>The object contianing the request handler</p> |
| method | <code>string</code> | <p>The method name used to handle this request</p> |


* * *

<a name="KoaApiHandle.notFound"></a>

### KoaApiHandle.notFound()
<p><code>.response</code> can handle all requests that come through Koa. This ensures standard response format and handling. Pass it an object and the method used to handle the reponse</p>

**Kind**: static method of [<code>KoaApiHandle</code>](#KoaApiHandle)  
**Summary**: <p>Default API 404/Not found handler</p>  

* * *

<a name="KoaApiHandle.error"></a>

### KoaApiHandle.error()
<p><code>.error</code> provides a default error handler. This ensures any errors are moved into a standard response format. Supports Exceptions from <code>@mhio/exception</code>.</p>

**Kind**: static method of [<code>KoaApiHandle</code>](#KoaApiHandle)  
**Summary**: <p>Default API 404/Not found handler</p>  

* * *

