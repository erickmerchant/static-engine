var compose = require('static-compose');

module.exports = function (formulas) {

    var formulas = [].slice.call(arguments);

    if(!Array.isArray(formulas[0])) {

        formulas = [ formulas ];
    }

    return Promise.all(

    	formulas.map(function(plugins) {

	        return compose(plugins)([]);
	    })
    );
};
