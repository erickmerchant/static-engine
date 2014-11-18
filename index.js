var path = require('path');
var fs = require('fs');
var Promise = require('es6-promise').Promise;
var mkdirp = require('mkdirp');
var interpolate = require('./interpolate.js');

function Site(site_directory, renderer) {

    this.site_directory = site_directory;

    this.renderer = renderer;

    this.routes = [];

    this.befores = [];

    this.afters = [];
}

Site.prototype = {

    route: function (route) {

        return new Route(this, route);
    },

    build: function () {

        var site = this;

        var route_promises = site.routes.map(function (route){

            return site._run(route).then(function(pages){

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

    _run: function(route) {

        var site = this;

        return new Promise(function(resolve, reject){

            var i = -1;

            var next = function(pages) {

                if (++i < route.plugins.length) {

                    route.plugins[i](pages, next);

                    return;
                }

                resolve(pages);
            };

            Array.prototype.unshift.apply(route.plugins, site.befores);

            Array.prototype.push.apply(route.plugins, site.afters);

            next([]);
        });
    },

    _render: function(route, page) {

        var site = this;

        return new Promise(function(resolve, reject){

            if(site.renderer) {

                site.renderer(route.template, page, function (err, html) {

                    var url = interpolate(route.route, page || {});

                    var file = site.site_directory + url;

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

    this.plugins = [];
}

Route.prototype = {

    use: function (use) {

        if (typeof use == 'function') {

            this.plugins.push(use);

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
