'use strict';

var path = require('path');
var fs = require('fs');
var trim = require('trimmer');
var Q = require('q');
var mkdirp = require('mkdirp');

function interpolate(string, data) {

    return string.replace(/{([^{}]*)}/g, function(original, match) {

        var result = data;

        var parts = match.split('.');

        var i = -1;

        while(++i < parts.length - 1) {

            if(typeof result[parts[i]] === 'object') {

                result = result[parts[i]];
            }
            else {

                throw Error('failed to interpolate ' + parts.join('.') + ' at ' + parts.slice(0, i+1).join('.'));
            }
        }

        if(typeof result[parts[i]] === 'number' || typeof result[parts[i]] === 'string') {

            result = result[parts[i]];
        }
        else {

            throw Error('failed to interpolate ' + parts.join('.') + ' at ' + parts.slice(0, i+1).join('.'));
        }

        return result;
    });
};

function run_middleware(site, route) {

    var i = -1;

    var middleware = site.routes[route].middleware;

    var run_deferred = Q.defer();

    Array.prototype.unshift.apply(middleware, site.befores);

    Array.prototype.push.apply(middleware, site.afters);

    function next(pages) {

        if (++i < middleware.length) {

            middleware[i](pages, next);

            return;
        }

        run_deferred.resolve(pages);
    };

    next([]);

    return run_deferred.promise;
};

function make_pages(site, route, pages) {

    var render_promises = [];

    var make_deferred = Q.defer();

    if (site.routes[route].template) {

        if (!pages.length) {

            pages = [{}];
        }

        pages.forEach(function (page) {

            var render_deferred = Q.defer();

            render_promises.push(render_deferred.promise);

            site.renderer && site.renderer(site.routes[route].template, page, function (err, html) {

                try
                {
                    var url = interpolate(site.routes[route].route, page || {});

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
        });
    }

    Q.all(render_promises).then(
        function () {

            make_deferred.resolve();
        },
        function(err){

            make_deferred.reject(err);
        }
    );

    return make_deferred.promise;
};

function run_route(site, route) {

    var run_deferred = Q.defer();

    Q.when(run_middleware(site, route)).then(
        function(pages){

            Q.when(make_pages(site, route, pages)).then(
                function () {

                    run_deferred.resolve();
                },
                function(err){

                    run_deferred.reject(err);
                }
            );
        },
        function(err){

            run_deferred.reject(err);
        }
    );

    return run_deferred.promise;
}

function Site(site_directory, renderer) {

    this.site_directory = site_directory;

    this.renderer = renderer;

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

            route_promises.push(run_route(this, route));
        }
    }

    Q.all(route_promises).then(
        function () {

            build_deferred.resolve();
        },
        function(err) {

            build_deferred.reject(err);
        }
    );

    return build_deferred.promise;
};

Site.prototype.before = function (before) {

    this.befores.push(before);
};

Site.prototype.after = function (after) {

    this.afters.push(after);
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

module.exports = function (site_directory, renderer) {

    return new Site(site_directory, renderer);
};
