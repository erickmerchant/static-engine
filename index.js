var once = require('once')
var dezalgo = require('dezalgo')

module.exports = function () {
  var collections = new Array(arguments.length)
  var i

  for (i = 0; i < collections.length; ++i) {
    collections[i] = arguments[i]
  }

  collections = collections.map(function (plugins) {
    var i = -1

    return new Promise(function (resolve, reject) {
      var next = function (data) {
        var result, done

        if (++i < plugins.length) {
          done = once(dezalgo(function (err, data) {
            if (err) {
              reject(err)
            } else {
              next(data)
            }
          }))

          result = plugins[i](data, done)

          if (result && typeof result === 'object' && result instanceof Promise) {
            result.then(function (data) {
              done(null, data)
            }, done)
          }
        } else {
          resolve(data)
        }
      }

      next([])
    })
  })

  return Promise.all(collections)
}
