var Promise = require('es6-promise').Promise;
var compose = require('./compose');

module.exports = function (formulas) {

    var promises = formulas.map(function(plugins) {

        return compose(plugins)([]);
    });

    return Promise.all(promises);
};
