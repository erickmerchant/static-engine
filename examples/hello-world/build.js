var nunjucks = require('nunjucks');
var engine = require('static-engine');

nunjucks.configure('', {
    autoescape: true
});

var site = engine.site('./build/', nunjucks.render);

site.route('/').render('template.html');

site.route('/{name}.html').use({ name: 'Erick' }).render('template.html');

site.build();
