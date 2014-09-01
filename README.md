# static-engine

A package for building static web content.

## hello world example

```js
// package.json
{
  "name": "hello-world",
  "dependencies": {
    "nunjucks": "^1.0.5",
    "static-engine": "0.1.0"
  }
}
```

```html
{# template.html #}
<p>Hello {{ name|default('world') }}!</p>
```

```js
// build.js
var nunjucks = require('nunjucks');
var engine = require('static-engine');

nunjucks.configure('', {
    autoescape: true
});

var site = engine.site('./build/', nunjucks.render);

site.route('/').render('template.html');

site.route('/{name}.html').use({ name: 'Erick' }).render('template.html');

site.build();
```
