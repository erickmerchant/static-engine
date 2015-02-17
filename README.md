# static-engine

[![Dependency Status](https://david-dm.org/erickmerchant/static-engine.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine) [![devDependency Status](https://david-dm.org/erickmerchant/static-engine/dev-status.svg?style=flat-square)](https://david-dm.org/erickmerchant/static-engine#info=devDependencies)

The module exports a function that you call with one or more arrays of [plugins](https://github.com/erickmerchant/static-compose#plugins). Each array of plugins is passed to [static-compose](https://github.com/erickmerchant/static-compose) and then an empty result is passed to the resulting function. It returns a promise.

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

Static-engine plugins should expect an array and return an array via one of the two ways available to plugins.
