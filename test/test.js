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


        });
    });
});
