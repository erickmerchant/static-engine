var engine = require('./index.js')
var tap = require('tap')

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

tap.test('should return a promise', function (t) {
  t.ok(promise instanceof Promise)

  t.end()
})

tap.test('should have expected results', function (t) {
  promise.then(function (pages) {
    t.deepEqual(pages, [['a', 'b'], ['c', 'd']])

    t.end()
  })
  .catch(t.end)
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

tap.test('should handle errors from callbacks', function (t) {
  failingFromCallback.catch(function (err) {
    t.equal('An error occurred', err.message)

    t.end()
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

tap.test('should handle errors from promises', function (t) {
  failingFromPromise.catch(function (err) {
    t.equal('An error occurred', err.message)

    t.end()
  })
})
