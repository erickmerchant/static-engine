var assert = require('chai').assert;
var engine = require('../index.js');
var mock = require('mock-fs');
var fs = require('fs');
var Q = require('q');
var site_directory = './test/build/';

mock({});

function push(literal) {

    return function (pages, next) {

        pages.push(literal);

        next(pages);
    };
};

function render(template, page, done) {

    done(null, '' + template + ': ' + (page && page.test ? page.test : ''));
};

beforeEach(function() { mock({'./test/build/': {}})  });

describe('engine', function () {

    describe('.build()', function () {

        describe('when pages.length == 0', function () {

            it('site_directory should contain the expected files', function (done) {

                var site = engine(site_directory, render);

                site.route('/test.html').render('test.html');

                Q.when(site.build()).then(
                    function(err){

                        if (err) done(err);
                        else {

                            fs.readdir(site_directory, function (err, files) {

                                if (err) done(err);
                                else {

                                    assert.lengthOf(files, 1);

                                    assert.include(files, 'test.html');

                                    done();
                                }
                            });
                        }
                    },
                    function(err) {

                        done(err);
                    }
                );
            });
        });

        describe('when pages.length > 1', function () {

            it('site_directory should contain the expected files', function (done) {

                var site = engine(site_directory, render);

                site.route('/{test}.html').use(push({test: 'test-a'})).use(push({test: 'test-b'})).render('test.html');

                Q.when(site.build()).then(
                    function(err){

                        if (err) done(err);
                        else {

                            fs.readdir(site_directory, function (err, files) {

                                if (err) done(err);
                                else {

                                    assert.lengthOf(files, 2);

                                    assert.include(files, 'test-a.html');

                                    assert.include(files, 'test-b.html');

                                    done();
                                }
                            });
                        }
                    },
                    function(err) {

                        done(err);
                    }
                );
            });
        });

        describe('middleware', function () {

            it('should be called in the correct order', function (done) {

                var site = engine(site_directory, render);

                var order = 0;

                var push = function(literal) {

                    return function (pages, next) {

                        literal.order = order++;

                        pages.push(literal);

                        next(pages);
                    };
                };
    site.route('/{test}-{order}.html').use(push({test:'test-c'})).use(push({test:'test-d'})).render('test.html');

                site.before(push({test:'test-a'}));

                site.before(push({test:'test-b'}));

                site.after(push({test:'test-e'}));

                site.after(push({test:'test-f'}));

                Q.when(site.build()).then(
                    function(err){

                        if (err) done(err);
                        else {

                            fs.readdir(site_directory, function (err, files) {

                                if (err) done(err);
                                else {

                                    assert.include(files, 'test-a-0.html');

                                    assert.include(files, 'test-b-1.html');

                                    assert.include(files, 'test-c-2.html');

                                    assert.include(files, 'test-d-3.html');

                                    assert.include(files, 'test-e-4.html');

                                    assert.include(files, 'test-f-5.html');

                                    done();
                                }
                            });
                        }
                    },
                    function(err) {

                        done(err);
                    }
                );
            });
        });
    });
});
