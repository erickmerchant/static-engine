# static-engine

[![Dependency Status](https://david-dm.org/erickmerchant/static-engine.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine) [![devDependency Status](https://david-dm.org/erickmerchant/static-engine/dev-status.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine#info=devDependencies) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

It started out as a really abstract static site generator. While most static site generators are focused around the idea of a file, static-engine doesn't assume where the data is coming from or even what you want to do with it. Everything is done with plugins that take in an array of objects, and return an array of objects.

Call static-engine with one or more arrays of plugins. Each array of plugins is composed such that each plugin is called with the result from the previous or in the case of the first one, an empty array.

Each array of plugins passed to it creates a promise that is resolved when all plugins have finished. Those promises in turn result in a larger promise that is only resolved when all plugins from every array is finished. Static-engine returns that promise.

```javascript
// examples of use
var engine = require('static-engine')
var pluginA = require('plugin-a')
var pluginB = require('plugin-b')
var pluginC = require('plugin-c')

engine([pluginA, pluginB], [pluginC])
  .then(function (data) {
    console.log(data)
  })
  .catch(function (err) {
    console.error(err)
  })
```

## plugins

Plugins are called with the data returned from the plugin before it (or for the initial one, an empty array) and a done callback. Using the callback is optional; plugins may also return a Promise.

### examples

In these examples each plugin is simply pushing a new object to the array.

```javascript
// a plugin that uses the callback
module.exports = function (data, done) {
  data.push({})

  done(null, data)
}
```

```javascript
// a plugin that returns a Promise
module.exports = function (data) {
  return new Promise(function (reject, resolve) {
    data.push({})

    resolve(data)
  })
}
```

Plugins are just functions obviously. They don't have to be modules.
