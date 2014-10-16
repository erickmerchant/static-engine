var assert = require('chai').assert;
var engine = require('../index.js');
var fs = require('fs');
var rimraf = require('rimraf');
var Q = require('q');
var site_directory = './test/build/';

function cleanUp(done) {

    rimraf('./test/build/', done);
};

function push(literal) {

    return function (pages, next) {

        pages.push(literal);

        next(pages);
    };
};

function render(template, page, done) {

    done(null, '<p>' + (page && page.test ? page.test : '') + '</p>');
};

beforeEach(cleanUp);

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
