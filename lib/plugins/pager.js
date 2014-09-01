var _ = require('lodash');

module.exports = function () {

    return function (pages, next) {

        _.each(pages, function (val, key) {

            if (key - 1 > -1) {

                pages[key].previous = pages[key - 1];
            }

            if (key + 1 < pages.length) {

                pages[key].next = pages[key + 1];
            }
        });

        next(pages);
    };
};
