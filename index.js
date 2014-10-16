'use strict';

var path = require('path');
var fs = require('fs');
var trim = require('trimmer');
var Q = require('q');
var interpolate = require('interpolate');
var mkdirp = require('mkdirp');

function Site(site_directory, template_engine) {

    this.site_directory = site_directory;

    this.template_engine = template_engine;

    this.routes = {};

    this.befores = [];

    this.afters = [];

    this.index_page = 'index.html';
}

Site.prototype.route = function (route) {

    this.routes[route] = new Route(route, this);

    return this.routes[route];
};

Site.prototype.build = function () {

    var route_promises = [];

    var build_deferred = Q.defer();

    var route;

    for(route in this.routes) {

        if (this.routes.hasOwnProperty(route)) {

            route_promises.push(this.routes[route].run());
        }
    }

    Q.all(route_promises).then(function () {

        build_deferred.resolve();
    });

    return build_deferred.promise;
};

Site.prototype.before = function (fn) {

    this.befores.push(fn);
};

Site.prototype.after = function (fn) {

    this.afters.push(fn);
};

function Route(route, site) {

    this.route = route;

    this.site = site;

    this.middleware = [];

    this.pages = [];
}

Route.prototype.alias = function (alias) {

    this.site.routes[alias] = this.site.routes[this.route];

    return this;
};

Route.prototype.use = function (use) {

    if (typeof use == 'function') {

        this.middleware.push(use);

        return this;
    }

    throw new Error("'use' only accepts one function");
};

Route.prototype.render = function (template) {

    this.template = template;
};

Route.prototype.run = function () {

    var i = -1;

    var middleware = this.middleware;

    var route = this;

    var run_deferred = Q.defer();

    Array.prototype.unshift.apply(middleware, route.site.befores);

    Array.prototype.push.apply(middleware, route.site.afters);

    function next(pages) {

        if (++i < middleware.length) {

            middleware[i](pages, next);

            return;
        }

        Q.when(route.finish(pages)).then(function () {

            run_deferred.resolve();
        });
    };

    next([]);

    return run_deferred.promise;
};

Route.prototype.finish = function (pages) {

    var route = this;

    var render_promises = [];

    var finalize_deferred = Q.defer();

    if (route.template) {

        if (!pages.length) {

            pages = [{}];
        }

        pages.forEach(function (page) {

            var render_deferred = Q.defer();

            render_promises.push(render_deferred.promise);

            route.site.template_engine && route.site.template_engine(route.template, page, function (err, html) {

                    var url = interpolate(route.route, page || {});

                    if (url.substr(-1) == '/') {

                        url += route.site.index_page;
                    }

                    var file = route.site.site_directory + trim.left(url, '/');

                    var directory;

                    directory = path.dirname(file);

                    mkdirp(directory, function (err) {

                        if (err) throw err;

                        fs.writeFile(file, html, function (err, data) {

                            if (err) throw err;

                            render_deferred.resolve();
                        });
                    });
                });
        });
    }

    Q.all(render_promises).then(function () {

        finalize_deferred.resolve();
    });

    return finalize_deferred.promise;
};


module.exports = function (site_directory, template_engine) {

    return new Site(site_directory, template_engine);
};
