var assert = require('chai').assert;
var engine = require('../index.js');
var mock = require('mock-fs');
var fs = require('fs');
var Q = require('q');
var site_directory = './test/build/';

function push(literal) {

    return function (pages, next) {

        pages.push(literal);

        next(pages);
    };
};

function render(template, page, done) {

    done(null, (page && page.test ? page.test : ''));
};

beforeEach(function() { mock({'./test/build/': {}})  });

describe('site', function () {

    describe('.constructor()', function(){

        it('instance should have expected methods', function (done) {

            var site = engine(site_directory, render);

            assert.isFunction(site.route);

            assert.isFunction(site.build);

            assert.isFunction(site.before);

            assert.isFunction(site.after);

            done();
        });
    });

    describe('.before()', function(){

        it('should add middleware that\'s called before', function (done) {

            var site = engine(site_directory, render);

            site.route('/test.html').render('test.html');

            site.before(function(pages, next){

                pages.push({test: 'test-a'})

                next(pages);
            });

            Q.when(site.build()).then(
                function(){

                    fs.readFile(site_directory+'test.html', function (err, data) {

                        if (err) done(err);
                        else {

                            assert.equal(data, 'test-a');

                            done();
                        }
                    });
                },
                function(err) {

                    done(err);
                }
            );
        });
    });

    describe('.after()', function(){

        it('should add middleware that\'s called after', function (done) {

            var site = engine(site_directory, render);

            site.route('/test.html').use(push({test:'test-a'})).render('test.html');

            site.after(function(pages, next){

                pages.forEach(function(page, i){

                    pages[i].test = 'test-b';
                });

                next(pages);
            });

            Q.when(site.build()).then(
                function(){

                    fs.readFile(site_directory+'test.html', function (err, data) {

                        if (err) done(err);
                        else {

                            assert.equal(data, 'test-b');

                            done();
                        }
                    });
                },
                function(err) {

                    done(err);
                }
            );
        });
    });

    describe('.build()', function () {

        it('site_directory should contain the expected files when pages.length == 0', function (done) {

            var site = engine(site_directory, render);

            site.route('/test.html').render('test.html');

            Q.when(site.build()).then(
                function(){

                    fs.readdir(site_directory, function (err, files) {

                        if (err) done(err);
                        else {

                            assert.lengthOf(files, 1);

                            assert.include(files, 'test.html');

                            done();
                        }
                    });
                },
                function(err) {

                    done(err);
                }
            );
        });

        it('site_directory should contain the expected files when pages.length > 1', function (done) {

            var site = engine(site_directory, render);

            site.route('/{test}.html').use(push({test: 'test-a'})).use(push({test: 'test-b'})).render('test.html');

            Q.when(site.build()).then(
                function(){

                    fs.readdir(site_directory, function (err, files) {

                        if (err) done(err);
                        else {

                            assert.lengthOf(files, 2);

                            assert.include(files, 'test-a.html');

                            assert.include(files, 'test-b.html');

                            done();
                        }
                    });
                },
                function(err) {

                    done(err);
                }
            );
        });

        it('middleware should be called in the correct order', function (done) {

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
                function(){

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
                },
                function(err) {

                    done(err);
                }
            );
        });

        it('interpolate should throw an error when a var isn\'t defined', function (done) {

            var site = engine(site_directory, render);

            site.route('/{test}.html').render('test.html');

            Q.when(site.build()).then(
                function(){

                    assert.notOk(true);

                    done();
                },
                function(err){

                    assert.ok(true);

                    done();
                }
            )
            .done();
        });


        it('each file should contain what is expected', function (done) {

            var site = engine(site_directory, render);

            site.route('/test.html').use(push({test: 'test-a'})).render('test.html');

            Q.when(site.build()).then(
                function(){

                    fs.readFile(site_directory+'test.html', function (err, data) {

                        if(err) done(err);
                        {
                            assert.equal(data, 'test-a');

                            done();
                        }
                    });
                },
                function(err) {

                    done(err);
                }
            );
        });
    });

    describe('.route()', function(){

        it('it should create and return a route', function (done) {

            var site = engine(site_directory, render);

            var route = site.route('/test.html');

            assert.isFunction(route.use);

            assert.isFunction(route.render);

            done();
        });
    });
});

describe('route', function(){

    describe('.use()', function(){

        it('should throw an error if a function is not given', function(done) {

            var site = engine(site_directory, render);

            var route = site.route('/test.html');

            try
            {
                route.use('test');

                assert.notOk(true);
            }
            catch(e)
            {
                assert.ok(true);
            }

            done();
        });

        it('should return the route', function(done) {

            var site = engine(site_directory, render);

            var route = site.route('/test.html');

            var result = route.use(function(){});

            assert.equal(route, result);

            done();
        });
    });

    describe('.render()', function(){

        it('should return the route', function(done) {

            var site = engine(site_directory, render);

            var route = site.route('/test.html');

            var result = route.render('test.html');

            assert.equal(route, result);

            done();
        });
    });
});
