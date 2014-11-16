var path = require('path');
var fs = require('fs');
var trim = require('trimmer');
var Promise = require('es6-promise').Promise;
var mkdirp = require('mkdirp');
var interpolate = require('./interpolate.js');

function Site(site_directory, renderer) {

    this.site_directory = site_directory;

    this.renderer = renderer;

    this.routes = [];

    this.befores = [];

    this.afters = [];

    this.index_page = 'index.html';
}

Site.prototype = {

    route: function (route) {

        return new Route(this, route);
    },

    build: function () {

        var site = this;

        var route_promises = site.routes.map(function (route){

            return site._middleware(route).then(function(pages){

                var render_promises = [];

                if (route.template) {

                    if (!pages.length) {

                        pages = [{}];
                    }

                    render_promises = pages.map(function (page) {

                        return site._render(route, page);
                    });
                }

                return Promise.all(render_promises);
            });
        });

        return Promise.all(route_promises);
    },

    _middleware: function(route) {

        var site = this;

        return new Promise(function(resolve, reject){

            var i = -1;

            var next = function(pages) {

                if (++i < route.middleware.length) {

                    route.middleware[i](pages, next);

                    return;
                }

                resolve(pages);
            };

            Array.prototype.unshift.apply(route.middleware, site.befores);

            Array.prototype.push.apply(route.middleware, site.afters);

            next([]);
        });
    },

    _render: function(route, page) {

        var site = this;

        return new Promise(function(resolve, reject){

            if(site.renderer) {

                site.renderer(route.template, page, function (err, html) {

                    var url = interpolate(route.route, page || {});

                    if (url.substr(-1) == '/') {

                        url += site.index_page;
                    }

                    var file = site.site_directory + trim.left(url, '/');

                    var directory;

                    directory = path.dirname(file);

                    mkdirp(directory, function (err) {

                        if (err) reject(err);

                        fs.writeFile(file, html, function (err, data) {

                            if (err) reject(err);

                            resolve();
                        });
                    });
                });
            }
        });
    },

    before: function (before) {

        this.befores.push(before);
    },

    after: function (after) {

        this.afters.push(after);
    }
};

function Route(site, route) {

    this.site = site;

    this.route = route;

    this.middleware = [];
}

Route.prototype = {

    use: function (use) {

        if (typeof use == 'function') {

            this.middleware.push(use);

            return this;
        }

        throw new Error("'use' only accepts a function");
    },

    render: function (template) {

        this.template = template;

        this.site.routes.push(this);

        return this;
    }
};

module.exports = function (site_directory, renderer) {

    return new Site(site_directory, renderer);
};
