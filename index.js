'use strict';
/**
 * Module dependencies.
 */
const debug = require('debug')('koa-better-static2');
const {normalize, resolve, parse, sep} = require('path');
const assert = require('assert');
const send = require('./send');
const resolvePath = require('resolve-path');
/**
 * Serve static files from `root`.
 *
 * @param {String} root
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */
const serve = (root, opts) => {
  assert(root, 'root directory is required to serve files');
  const options = Object.assign({
    index: false,
    maxage: 0,
    hidden: false,
    ifModifiedSinceSupport: true
  }, opts);
  const normalizedRoot = normalize(resolve(root));
  debug('static "%s" %j', root, options);
  return async (ctx, next) => {
    let done = false;
    if (ctx.method == 'HEAD' || ctx.method == 'GET') {
      let path = ctx.path.substr(parse(ctx.path).root.length);
      try {
        path = decodeURIComponent(path);
      } catch (e) {
        ctx.throw('Could not decode path', 400);
        return;
      }
      if (options.index && '/' == ctx.path[ctx.path.length - 1])
        path += options.index;
      path = resolvePath(normalizedRoot, path);
      if (!options.hidden && isHidden(root, path))
        return;
      try {
        done = await send(ctx, path, options);
      } catch (err) {
        if (err.status !== 404) {
          throw err;
        }
      }
    }
    if (!done) {
      await next();
    }
  };
};
function isHidden(root, path) {
  path = path.substr(root.length).split(sep);
  return path.includes('.');
}
/**
 * Expose `serve()`.
 */
module.exports = serve;