
'use strict';

const request = require('supertest');
const serve = require('..');
const koa = require('koa');

describe('serve(root)', function(){
    describe('when root = "."', function(){
      it('should serve from cwd', function(done){
        const app = koa();

        app.use(serve('.'));

        request(app.listen())
        .get('/package.json')
        .expect(200, done);
      })
    })

    describe('when path is not a file', function(){
      it('should 404', function(done){
        const app = koa();

        app.use(serve('test/fixtures'));

        request(app.listen())
        .get('/something')
        .expect(404, done);
      })
    })

    describe('when upstream middleware responds', function(){
      it('should respond', function(done){
        const app = koa();

        app.use(serve('test/fixtures'));

        app.use(function *(next){
          yield next;
          this.body = 'hey';
        });

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect('world', done);
      })
    })

    describe('the path is valid', function(){
      it('should serve the file', function(done){
        const app = koa();

        app.use(serve('test/fixtures'));

        request(app.listen())
        .get('/hello.txt')
        .expect(200)
        .expect('world', done);
      })
    })

    describe('.index', function(){
      describe('when present', function(){
        it('should alter the index file supported', function(done){
          const app = koa();

          app.use(serve('test/fixtures', { index: 'index.txt' }));

          request(app.listen())
          .get('/')
          .expect(200)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('text index', done);
        })
      })

      describe('when omitted', function(){
        it('should use index.html', function(done){
          const app = koa();

          app.use(serve('test/fixtures'));

          request(app.listen())
          .get('/world/')
          .expect(200)
          .expect('Content-Type', 'text/html; charset=utf-8')
          .expect('html index', done);
        })
      })

      describe('when disabled', function(){
        it('should not use index.html', function(done){
          const app = koa();

          app.use(serve('test/fixtures', { index: false }));

          request(app.listen())
          .get('/world/')
          .expect(404, done);
        })
      })
    })

    describe('when method is not `GET` or `HEAD`', function(){
      it('should 404', function(done){
        const app = koa();

        app.use(serve('test/fixtures'));

        request(app.listen())
        .post('/hello.txt')
        .expect(404, done);
      })
    })

  describe('option - format', function(){
    describe('when format: false', function(){
      it('should 404', function(done){
        const app = koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: false
        }));

        request(app.listen())
        .get('/world')
        .expect(404, done);
      })

      it('should 200', function(done){
        const app = koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: false
        }));

        request(app.listen())
        .get('/world/')
        .expect(200, done);
      })
    })

    describe('when format: true', function(){
      it('should 200', function(done){
        const app = koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: true
        }));

        request(app.listen())
        .get('/world')
        .expect(200, done);
      })

      it('should 200', function(done){
        const app = koa();

        app.use(serve('test/fixtures', {
          index: 'index.html',
          format: true
        }));

        request(app.listen())
        .get('/world/')
        .expect(200, done);
      })
    })
  })



})
