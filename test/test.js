var assert = require('assert')
var engine = require('../index.js')
var describe = require('mocha').describe
var it = require('mocha').it

describe('engine', function () {
  var promise = engine(
    [
      function (pages, resolve) {
        pages.push('a')
        resolve(null, pages)
      },
      function (pages, resolve) {
        pages.push('b')
        resolve(null, pages)
      },
      function (pages, resolve) {
        pages.push('c')
        resolve(null, pages)
      }
    ],
    [
      function (pages, resolve) {
        pages.push('d')
        resolve(null, pages)
      },
      function (pages, resolve) {
        pages.push('e')
        resolve(null, pages)
      }
    ]
  )

  it('should return a promise', function (done) {
    assert.ok(promise instanceof Promise)

    done()
  })

  it('should have expected results', function (done) {
    promise.then(function (pages) {
      assert.deepEqual(pages, [['a', 'b', 'c'], ['d', 'e']])

      done()
    })
    .catch(done)
  })
})
