
'use strict';

const assert = require('assert');
const request = require('supertest');
const serve = require('../');
const Koa = require('koa');
const mount = require('koa-mount');

describe('serve(root)', function() {
  describe('when root = "."', function() {
    it('should serve from cwd', function(done) {
      const app = new Koa();
      app.use(serve('.'));
      request(app.callback())
        .get('/package.json')
        .expect(200, done);
    })
  })

  describe('when path is not a file', function() {
    it('should 404', function(done) {
      const app = new Koa();

      app.use(serve('test/fixtures'));

      request(app.callback())
        .get('/something')
        .expect(404, done);
    })
  })

  describe('when upstream middleware responds', function() {
    it('should respond', function(done) {
      const app = new Koa();

      app.use(serve('test/fixtures'));

      app.use((ctx, next) => {
        return next().then(() => {
          ctx.body = 'hey';
        });
      });

      request(app.callback())
        .get('/hello.txt')
        .expect(200)
        .expect('world', done);
    })
  })

  describe('the path is valid', function() {
    it('should serve the file', function(done) {
      const app = new Koa();

      app.use(serve('test/fixtures'));

      request(app.callback())
        .get('/hello.txt')
        .expect(200)
        .expect('world', done);
    })
  })

  describe('.index', function() {
    describe('when present', function() {
      it('should alter the index file supported', function(done) {
        const app = new Koa();

        app.use(serve('test/fixtures', { index: 'index.txt' }));

        request(app.callback())
          .get('/')
          .expect(200)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('text index', done);
      })
    })

    describe('when added', function() {
      it('should use index.html', function(done) {
        const app = new Koa();

        app.use(serve('test/fixtures', { index: 'index.html' }));

        request(app.callback())
          .get('/world/')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect('html index', done);
      })
    });

    describe('by default', function() {
      it('should not use index.html', function(done) {
        const app = new Koa();

        app.use(serve('test/fixtures'));

        request(app.callback())
          .get('/world/')
          .expect(404, done);
      })
    })
  })

  describe('when method is not `GET` or `HEAD`', function() {
    it('should 404', function(done) {
      const app = new Koa();

      app.use(serve('test/fixtures'));

      request(app.callback())
        .post('/hello.txt')
        .expect(404, done);
    })
  })

  describe('option - format', function() {
    describe('when format: false', function() {
      it('should 404', function(done) {
        const app = new Koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: false
        }));

        request(app.callback())
          .get('/world')
          .expect(404, done);
      })

      it('should 200', function(done) {
        const app = new Koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: false
        }));

        request(app.callback())
          .get('/world/')
          .expect(200, done);
      })
    })

    describe('when format: true', function() {
      it('should 200', function(done) {
        const app = new Koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: true
        }));

        request(app.callback())
          .get('/world')
          .expect(200, done);
      })

      it('should 200', function(done) {
        const app = new Koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: true
        }));

        request(app.callback())
          .get('/world/')
          .expect(200, done);
      })
    })
  });


  describe('Support if-modified-since', function() {
    it('should 304', function(done) {
      const app = new Koa();

      app.use(serve('test/fixtures'));

      request(app.callback())
        .get('/world/index.html')
        .expect(200)
        .end(function(err, response) {
          if (err)
            done(err);


          var lastModified = response.headers['last-modified'];


          request(app.callback())
            .get('/world/index.html')
            .set('If-Modified-Since', lastModified)
            .expect(304, done);

        });
    });


    it('should 200', function(done) {
      const app = new Koa();

      app.use(serve('test/fixtures'));

      request(app.callback())
        .get('/world/index.html')
        .set('if-modified-since', 'Mon Jan 18 2011 23:04:34 GMT-0600')
        .expect(200, done)
    });
  });

  describe('Work with koa-mount', function() {

    it('should mount fine', function(done) {

      const app = new Koa();

      app.use(
        mount('/fixtures',
          serve(require('path').join(__dirname, '/fixtures'))
        ));


      request(app.callback())
        .get('/fixtures/hello.txt')
        .expect(200)
        .end(function(err, data) {
          // console.log('Got response: ', err, data);
          done(err);
        })



    });

  });

});

// This is more of a test of js, than of the logic. But something we rely on
describe('Dates should truncate not, round', function() {

  it('should mount fine', function() {

    var str = new Date().toUTCString();

    let ms = Date.parse(str);
    ms += 999; // add 999 ms


    let nd = new Date(ms);

    assert(nd.toUTCString() === str);

  });


});

