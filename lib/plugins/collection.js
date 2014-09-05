var _ = require('lodash');
var Q = require('q');

module.exports = function (name, plugin) {

    return function (pages, next) {

        var promises = [];

        _.forEach(pages, function (page) {

            var current = page[name] ? [page[name]] : [];

            var deferred = Q.defer();

            plugin(current, function (collection) {

                page[name] = collection;

                deferred.resolve(page);
            });

            promises.push(deferred.promise);
        });

        Q.all(promises).then(function(results){

            var pages = [];

            Array.prototype.push.apply(pages, results);

            next(pages);
        });
    };
};
