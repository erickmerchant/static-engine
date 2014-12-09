var Promise = require('es6-promise').Promise;

module.exports = function(plugins) {

    return function(data) {

        var i = -1;

        return new Promise(function(resolve, reject){

            var next = function(data) {

                if (++i < plugins.length) {

                    plugins[i](data).then(next);

                    return;
                }

                resolve(data);
            };

            next(data);
        });
    }
};
