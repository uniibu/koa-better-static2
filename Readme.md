# koa-better-static

A higher performance, drop in replacement for `koa-static`, with a few minimal changes:

* Doesn't use koa-send, but uses an optimized version
* Supports `If-Modified-Since` header for cache/performance
* Removal of `gzip` option (which checks for .gz files)
* Removal of `defer` (if you want this behavior, put the middleware at the end)
* No default `index` file
* Requires node 4 or greater.


## Installation

```bash
$ npm install koa-better-static
```

## API

```js
var koa = require('koa');
var app = koa();
app.use(require('koa-static')(root, opts));
```

* `opts` options object.

### Options

 - `maxage` Browser cache max-age in milliseconds. defaults to 0
 - `hidden` Allow transfer of hidden files. defaults to false
 - `index` Default file name, defaults to none
 - `ifModifiedSinceSupport`  by sending a 304 (not modified) response. Defaults to true
 - `format`  Allow trailing slashes for directories (e.g.  /directory and /directory. Defaults to true

## Example

```js
var serve = require('koa-better-static');
var koa = require('koa');
var app = koa();

// $ GET /package.json
app.use(serve('.'));

// $ GET /hello.txt
app.use(serve('test/fixtures'));

// or use absolute paths
app.use(serve(__dirname + '/test/fixtures'));

app.listen(3000);

console.log('listening on port 3000');
```

## License

  MIT
