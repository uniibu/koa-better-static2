/**
 * Module dependencies.
 */
const debug = require('debug')('koa-better-static2:send');
const assert = require('assert');
const {extname} = require('path');
const {promisify} = require('util');
const fs = require('fs');
const fsStat = promisify(fs.stat);
/**
 * Expose `send()`.
 */
module.exports = send;
/**
 * Send file at `path` with the
 * given `options` to the koa `ctx`.
 *
 * @param {Context} ctx
 * @param {String} root
 * @param {String} path
 * @param {Object} [opts]
 * @return {Function}
 * @api public
 */
async function send(ctx, path, opts) {
    assert(ctx, 'koa context required');
    assert(path, 'pathname required');
    assert(opts, 'opts required');
    // options
    debug('send "%s" %j', path, opts);
    const index = opts.index;
    const maxage = opts.maxage;
    const format = opts.format;
    const ifModifiedSinceSupport = opts.ifModifiedSinceSupport;
    let stats;
    try {
        stats = await fsStat(path);
        // Format the path to serve static file servers
        // and not require a trailing slash for directories,
        // so that you can do both `/directory` and `/directory/`
        if (stats.isDirectory()) {
            if (format && index) {
                path += `/${ index }`;
                stats = await fsStat(path);
            } else {
                return;
            }
        }
    } catch (err) {
        const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
        if (~notfound.indexOf(err.code))
            return;
        err.status = 500;
        throw err;
    }
    ctx.set('Cache-Control', `max-age=${ maxage / 1000 | 0 }`);
    // Check if we can return a cache hit
    if (ifModifiedSinceSupport) {
        const ims = Math.floor(Date.parse(ctx.get('If-Modified-Since')) / 1000);
        const mtime = Math.floor(stats.mtime.getTime() / 1000);
        if (ims && ims === mtime) {
            ctx.status = 304;
            return path;
        }
    }
    // stream
    ctx.set('Last-Modified', stats.mtime.toUTCString());
    ctx.set('Content-Length', stats.size);
    ctx.type = extname(path);
    ctx.body = fs.createReadStream(path);
    return path;
}