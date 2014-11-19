# static-engine

A package for building static web content.

[![Dependency Status](https://david-dm.org/erickmerchant/static-engine.svg)](https://david-dm.org/erickmerchant/static-engine)

## hello world example

```js
// package.json
{
  "name": "hello-world",
  "dependencies": {
    "nunjucks": "^1.0.5",
    "static-engine": "^4.0.0"
  }
}
```

```html
{# template.html #}
<p>Hello {{ name|default('World') }}!</p>
```

```js
// build.js
var nunjucks = require('nunjucks');
var engine = require('static-engine');
var push = function (literal) {

    return function (pages, next) {

        pages.push(literal);

        next(pages);
    };
};

nunjucks.configure('', {
    autoescape: true
});

var site = engine('./build/', nunjucks.render);

site.route('index.html').render('template.html');

site.route('{name}.html').use(push({ name: 'Erick' })).render('template.html');

site.build();
```
