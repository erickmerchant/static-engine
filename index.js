var Promise = require('es6-promise').Promise;
var series = require('static-engine-series');

module.exports = function (formulas) {

    var promises = formulas.map(function(plugins) {

        plugins = series(plugins);

        return plugins([]);
    });

    return Promise.all(promises);
};
