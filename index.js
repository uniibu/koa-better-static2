
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

  var options = Object.assign({
    index: false,
    maxage: 0,
    hidden: false,
    ifModifiedSinceSupport: true
  }, opts);

  const normalizedRoot = normalize(resolve(root));

  // options
  debug('static "%s" %j', root, opts);

  return function *serve(next){

    if (this.method == 'HEAD' || this.method == 'GET') {

      var path = this.path.substr(parse(this.path).root.length);
      try {
        path = decodeURIComponent(path);
      } catch (ex) {
        this.throw('Could not decode path', 400);
        return;
      }

      if (options.index && '/' == this.path[this.path.length - 1])
        path += options.index;

      path = resolvePath(normalizedRoot, path);

      if (!options.hidden && isHidden(root, path))
        return;

      if (yield send(this, path, options)) return;
    }
    yield* next;
  };

}

// TODO: this can be sped up, with an findIndexOf loop
function isHidden(root, path) {
  path = path.substr(root.length).split(sep);
  for(var i = 0; i < path.length; i++) {
    if(path[i][0] === '.') return true;
  }
  return false;
}

