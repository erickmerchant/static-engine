var assert = require('assert')
var engine = require('./index.js')
var describe = require('mocha').describe
var it = require('mocha').it

describe('engine', function () {
  var promise = engine(
    [
      function (pages, done) {
        pages.push('a')
        done(null, pages)
      },
      function (pages, done) {
        pages.push('b')
        done(null, pages)
      }
    ],
    [
      function (pages) {
        return new Promise(function (resolve, reject) {
          pages.push('c')
          resolve(pages)
        })
      },
      function (pages) {
        return new Promise(function (resolve, reject) {
          pages.push('d')
          resolve(pages)
        })
      }
    ]
  )

  it('should return a promise', function (done) {
    assert.ok(promise instanceof Promise)

    done()
  })

  it('should have expected results', function (done) {
    promise.then(function (pages) {
      assert.deepEqual(pages, [['a', 'b'], ['c', 'd']])

      done()
    })
    .catch(done)
  })

  var failingFromCallback = engine(
    [
      function (pages, done) {
        pages.push('a')
        done(null, pages)
      },
      function (pages, done) {
        done(new Error('An error occurred'))
      }
    ]
  )

  it('should handle errors from callbacks', function (done) {
    failingFromCallback.catch(function (err) {
      assert.equal('An error occurred', err.message)

      done()
    })
  })

  var failingFromPromise = engine(
    [
      function (pages) {
        return new Promise(function (resolve, reject) {
          pages.push('c')
          resolve(pages)
        })
      },
      function (pages) {
        return new Promise(function (resolve, reject) {
          reject(new Error('An error occurred'))
        })
      }
    ]
  )

  it('should handle errors from promises', function (done) {
    failingFromPromise.catch(function (err) {
      assert.equal('An error occurred', err.message)

      done()
    })
  })
})
