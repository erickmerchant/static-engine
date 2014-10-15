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

site.route('/').render('template.html');

site.route('/{name}.html').use(push({ name: 'Erick' })).render('template.html');

site.build();
