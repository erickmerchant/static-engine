var compose = require('static-compose');

module.exports = function (formulas) {

    if(!Array.isArray(formulas)) {

        formulas = [ [].slice.call(arguments) ];
    }
    else if(!Array.isArray(formulas[0])) {

        formulas = [].slice.call(arguments);
    }

    return Promise.all(

    	formulas.map(function(plugins) {

	        return compose(plugins)([]);
	    })
    );
};
