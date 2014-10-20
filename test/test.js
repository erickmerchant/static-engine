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

    done(null, '<p>' + (page && page.test ? page.test : '') + '</p>');
};

beforeEach(function() { mock({'./test/build/': {}})  });

describe('engine', function () {

    describe('.build()', function () {

        describe('when pages.length == 0', function () {


            it('site_directory should contain one file', function (done) {

                var site = engine(site_directory, render);

                site.route('/test.html').render('test.html');

                Q.when(site.build()).then(
                    function(err){

                        if (err) done(err);
                        else {

                            fs.readdir(site_directory, function (err, data) {

                                if (err) done(err);
                                else {

                                    assert.lengthOf(data, 1);

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
