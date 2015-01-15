var Promise = require('es6-promise').Promise;
var compose = require('static-compose');

module.exports = function (formulas) {

    if(!Array.isArray(formulas) || arguments.length > 1) {

        formulas = [].slice.call(arguments);
    }

    var promises = formulas.map(function(plugins) {

        return compose(plugins)([]);
    });

    return Promise.all(promises);
};
