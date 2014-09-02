module.exports = function (literal) {

    return function (pages, next) {

        pages.push(literal);

        next(pages);
    };
};
