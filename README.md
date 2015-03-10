# static-engine

[![Dependency Status](https://david-dm.org/erickmerchant/static-engine.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine) [![devDependency Status](https://david-dm.org/erickmerchant/static-engine/dev-status.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine#info=devDependencies)

It started out as a really abstract static site generator. While most static site generators are focused around the idea of a file, static-engine doesn't assume where the data is coming from or even what you want to do with it. Everything is done with plugins that take in an array of objects, and return an array of objects.

Call static-engine with one or more arrays of plugins. Each array of plugins is passed to [static-compose](https://github.com/erickmerchant/static-compose) and then an empty array is passed to the resulting function. It returns a promise.

You can also call it with multiple plugins. If called in this way they collectively are treated as a single array of plugins.

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

    }).catch(function(err){

        console.error(err);

    });

engine(pluginA, pluginB)
    .then(function(data){

        console.log(data);

    }).catch(function(err){

        console.error(err);

    });

```

See [static-compose](https://github.com/erickmerchant/static-compose#plugins) for further information on what is meant by plugin. static-engine plugins should expect an array and return an array via one of the two ways available to plugins.
