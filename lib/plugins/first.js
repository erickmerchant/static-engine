var _ = require('lodash');

module.exports = function () {

    return function (pages, next) {

        next([_.first(pages)]);
    };
};
