# koa-better-static2
[![Node version](https://img.shields.io/node/v/koa-better-static2.svg?style=flat)](http://nodejs.org/download/)
[![Koajs deps](https://img.shields.io/badge/Koajs-2.2.0-brightgreen.svg)](https://github.com/koajs/koa)
[![Build Status](https://travis-ci.org/uniibu/koa-better-static2.svg?branch=master)](https://travis-ci.org/uniibu/koa-better-static2)
[![David deps](https://david-dm.org/uniibu/koa-better-static2.svg)](https://david-dm.org/uniibu/koa-better-static2)
[![Coverage Status](https://coveralls.io/repos/github/uniibu/koa-better-static2/badge.svg?branch=master)](https://coveralls.io/github/uniibu/koa-better-static2?branch=master)

[![https://nodei.co/npm/koa-better-static2.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/koa-better-static2.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/koa-better-static2)


**NOTE: This is for  use with Koa 2.x.x and Nodejs 7.x.x. For Koa 1.x.x use https://github.com/ohomer/koa-better-static

This is a updated fork of koa-better-static by ohomer(https://github.com/ohomer) that uses latest Nodejs and Koajs version. 

A higher performance, drop in replacement for `koa-static`, with a few minimal changes:

* Doesn't use koa-send, but uses an optimized version
* Supports `If-Modified-Since` header for cache/performance
* Removal of `gzip` option (which checks for .gz files)
* Removal of `defer` (if you want this behavior, put the middleware at the end)
* No default `index` file
* Requires node 7 or greater.


## Installation

```bash
$ npm install koa-better-static2
```

## API

```js
const Koa = require('koa');
const serve = require('koa-better-static2');
const app = new Koa();
app.use(serve(root, opts));
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
const serve = require('koa-better-static2');
const Koa = require('koa');
const app = new Koa();

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
