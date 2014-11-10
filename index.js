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

        var route_promises = [];

        var site = this;

        var build_promise = new Promise(function(build_resolve, build_reject){

            site.routes.forEach(function (route){

                var route_promise = new Promise(function(route_resolve, route_reject){

                    var middleware_promise = new Promise(function(middleware_resolve, middleware_reject){

                        var i = -1;

                        var next = function(pages) {

                            if (++i < route.middleware.length) {

                                route.middleware[i](pages, next);

                                return;
                            }

                            middleware_resolve(pages);
                        };

                        Array.prototype.unshift.apply(route.middleware, site.befores);

                        Array.prototype.push.apply(route.middleware, site.afters);

                        next([]);
                    });

                    middleware_promise.then(
                        function(pages){

                            var render_promises = [];

                            if (route.template) {

                                if (!pages.length) {

                                    pages = [{}];
                                }

                                pages.forEach(function (page) {

                                    var render_promise = new Promise(function(render_resolve, render_reject){

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

                                                    if (err) render_reject(err);

                                                    fs.writeFile(file, html, function (err, data) {

                                                        if (err) render_reject(err);

                                                        render_resolve();
                                                    });
                                                });
                                            });
                                        }
                                    });

                                    render_promises.push(render_promise);
                                });
                            }

                            Promise.all(render_promises).then(route_resolve, route_reject);
                        },
                        route_reject
                    );
                });

                route_promises.push(route_promise);

            });

            Promise.all(route_promises).then(build_resolve, build_reject);
        });

        return build_promise;
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
