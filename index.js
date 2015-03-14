var once = require('once');

module.exports = function () {

    var collections = [].slice.call(arguments);

    if(!Array.isArray(collections[0])) {

        collections = [ collections ];
    }

    return Promise.all(

    	collections.map(function(plugins) {

            var i = -1;

            return new Promise(function(resolve, reject){

                var next = function(data) {

                    var result, done;

                    if (++i < plugins.length) {

                        done = once(function(err, data){

                            if(err) {
                                reject(err);
                            }
                            else {
                                next(data);
                            }
                        });

                        result = plugins[i](data, done);

                        if(typeof result.then == 'function') {

                            result.then(function(data){

                                done(null, data);

                            }, done);
                        }
                    }
                    else {

                        resolve(data);
                    }
                };

                next([]);
            });
	    })
    );
};
