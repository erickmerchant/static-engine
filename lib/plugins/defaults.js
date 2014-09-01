var yaml = require('js-yaml');
var fs = require('fs');
var _ = require('lodash');
var interpolate = require('interpolate');
var moment = require('moment');

module.exports = function (app, default_file) {

    var route = function (name, args) {

        if (!_.has(app.routes, name) || !app.routes[name].route || !args) return '';

        return interpolate(app.routes[name].route, args);
    };

    var now = moment();

    return function (pages, next) {

        fs.readFile(default_file, {
            encoding: 'utf-8'
        }, function (err, data) {

            var defaults = yaml.load(data);

            defaults.route = route;

            defaults.now = now;

            _.each(pages, function (val, key) {

                pages[key] = _.assign(val, defaults);
            });

            next(pages);
        });
    };
};
