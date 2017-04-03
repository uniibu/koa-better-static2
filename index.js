'use strict';

/**
 * Module dependencies.
 */

const normalize = require('path').normalize;
const resolve = require('path').resolve;
const parse = require('path').parse;
const sep = require('path').sep;

const assert = require('assert');
const debug = require('debug')('koa-better-static');
const send = require('./send');
const resolvePath = require('resolve-path');


/**
 * Expose `serve()`.
 */

module.exports = serve;

/**
 * Serve static files from `root`.
 *
 * @param {String} root
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */

function serve(root, opts) {
  assert(root, 'root directory is required to serve files');
  const options =  Object.assign({
    index: false,
    maxage: 0,
    hidden: false,
    ifModifiedSinceSupport: true
  }, opts);


  const normalizedRoot = normalize(resolve(root));


  // options
  debug('static "%s" %j', root, options);

  return function serve(ctx, next){
    if (ctx.method == 'HEAD' || ctx.method == 'GET') {
      let path = ctx.path.substr(parse(ctx.path).root.length);
      try {
        path = decodeURIComponent(path);
      } catch (ex) {
        ctx.throw('Could not decode path', 400);
        return;
      }
      if (options.index && '/' == ctx.path[ctx.path.length - 1])
        path += options.index;
      path = resolvePath(normalizedRoot, path);
      if (!options.hidden && isHidden(root, path)) return;

      return send(ctx, path, options).then(done => {
            if (!done) {
        return next();
      }
    });
    }
    return next();
  };

}
// used indexOf for better speed than for loop https://jsperf.com/js-multiloop
function isHidden(root, path) {
  path = path.substr(root.length).split(sep);
  return (path.indexOf('.') !== -1);
}
