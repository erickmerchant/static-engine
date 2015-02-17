var compose = require('static-compose');

module.exports = function () {

    var collections = [].slice.call(arguments);

    if(!Array.isArray(collections[0])) {

        collections = [ collections ];
    }

    return Promise.all(

    	collections.map(function(plugins) {

	        return compose(plugins)([]);
	    })
    );
};
