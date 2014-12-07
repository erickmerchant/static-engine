var Promise = require('es6-promise').Promise;

module.exports = function (formulas) {

    var promises = formulas.map(function(plugins) {

        var i = -1;

        return new Promise(function(resolve, reject){

            var next = function(pages) {

                if (++i < plugins.length) {

                    plugins[i](pages).then(next);

                    return;
                }

                resolve(pages);
            };

            next([]);
        });
    });

    return Promise.all(promises);
};
