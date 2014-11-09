var path = require('path');
var fs = require('fs');
var trim = require('trimmer');
var Q = require('q');
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

        var build_deferred = Q.defer();

        var site = this;

        this.routes.forEach(function (route){

            var route_deferred = Q.defer();

            var middleware_deferred = Q.defer();

            var i = -1;

            var next = function(pages) {

                if (++i < route.middleware.length) {

                    route.middleware[i](pages, next);

                    return;
                }

                middleware_deferred.resolve(pages);
            };

            Array.prototype.unshift.apply(route.middleware, site.befores);

            Array.prototype.push.apply(route.middleware, site.afters);

            next([]);

            Q.when(middleware_deferred.promise).then(
                function(pages){

                    var render_promises = [];

                    if (route.template) {

                        if (!pages.length) {

                            pages = [{}];
                        }

                        pages.forEach(function (page) {

                            var render_deferred = Q.defer();

                            render_promises.push(render_deferred.promise);

                            if(site.renderer) {

                                site.renderer(route.template, page, function (err, html) {

                                    try
                                    {
                                        var url = interpolate(route.route, page || {});

                                        if (url.substr(-1) == '/') {

                                            url += site.index_page;
                                        }

                                        var file = site.site_directory + trim.left(url, '/');

                                        var directory;

                                        directory = path.dirname(file);

                                        mkdirp(directory, function (err) {

                                            if (err) render_deferred.reject(err);

                                            fs.writeFile(file, html, function (err, data) {

                                                if (err) render_deferred.reject(err);

                                                render_deferred.resolve();
                                            });
                                        });
                                    }
                                    catch(e)
                                    {
                                        render_deferred.reject(e);
                                    }
                                });
                            }
                        });
                    }

                    Q.all(render_promises).then(
                        function () {

                            route_deferred.resolve();
                        },
                        function(err){

                            route_deferred.reject(err);
                        }
                    );
                },
                function(err){

                    route_deferred.reject(err);
                }
            );

            route_promises.push(route_deferred.promise);

        }, this);

        Q.all(route_promises).then(
            function () {

                build_deferred.resolve();
            },
            function(err) {

                build_deferred.reject(err);
            }
        );

        return build_deferred.promise;
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
