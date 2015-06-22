var once = require('once')
var dezalgo = require('dezalgo')

module.exports = function () {
  var collections = [].slice.call(arguments)

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

          if (result && typeof result.then === 'function') {
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
