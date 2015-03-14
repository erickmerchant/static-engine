# static-engine

[![Dependency Status](https://david-dm.org/erickmerchant/static-engine.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine) [![devDependency Status](https://david-dm.org/erickmerchant/static-engine/dev-status.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine#info=devDependencies)

It started out as a really abstract static site generator. While most static site generators are focused around the idea of a file, static-engine doesn't assume where the data is coming from or even what you want to do with it. Everything is done with plugins that take in an array of objects, and return an array of objects.

Call static-engine with one or more arrays of plugins. Each array of plugins is composed such that each is called with the result from the previous or in the case of the first one, an empty array.

You can also call it with multiple plugins. If called in this way they collectively are treated as a single array of plugins.

It returns a Promise.

```javascript
// examples of use

var engine = require('static-engine');
var pluginA = require('plugin-a');
var pluginB = require('plugin-b');
var pluginC = require('plugin-c');
var pluginD = require('plugin-d');

engine([pluginA, pluginB], [pluginC, pluginD])
    .then(function(data){

        console.log(data);
    })
    .catch(function(err){

        console.error(err);
    });

engine(pluginA, pluginB)
    .then(function(data){

        console.log(data);
    })
    .catch(function(err){

        console.error(err);
    });

```

## plugins

Plugins are called with the data returned from the plugin before it (or the initial data, an empty array) and a done callback. The callback is optional because plugins may also return a Promise.

### examples

In these examples each plugin is simply pushing a new object to the array.

```javascript
// a plugin that uses the callback

module.exports = function(data, done) {

    data.push({});

    done(null, data);
};
```

```javascript
// a plugin that returns a Promise

module.exports = function(data) {

    return new Promise(function(reject, resolve){

        data.push({});

        resolve(data);
    });
};
```

Plugins are just functions obviously. They don't have to be modules.
