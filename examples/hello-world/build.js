var nunjucks = require('nunjucks');
var engine = require('static-engine');
var push = engine.plugins.push;

nunjucks.configure('', {
    autoescape: true
});

var site = engine.site('./build/', nunjucks.render);

site.route('/').render('template.html');

site.route('/{name}.html').use(push({ name: 'Erick' })).render('template.html');

site.build();
