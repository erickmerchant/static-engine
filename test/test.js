var assert = require('chai').assert;
var engine = require('../index.js');
var Promise = require('es6-promise').Promise;

describe('engine', function(){

    it('accept an array of arrays of plugins and return a promise', function(done) {

        var promise = engine([
            [
                function(pages){
                    pages.push('a');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('b');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('c');
                    return Promise.resolve(pages);
                }
            ],
            [
                function(pages){
                    pages.push('d');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('e');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('f');
                    return Promise.resolve(pages);
                }
            ],
            [
                function(pages){
                    pages.push('g');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('h');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('i');
                    return Promise.resolve(pages);
                }
            ]
        ]);

        promise.then(function(){ done(); });
    });

    it('plugins should have the desired effect', function(done) {

        var promise = engine([
            [
                function(pages){
                    pages.push('a');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('b');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('c');
                    return Promise.resolve(pages);
                }
            ],
            [
                function(pages){
                    pages.push('d');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('e');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('f');
                    return Promise.resolve(pages);
                }
            ],
            [
                function(pages){
                    pages.push('g');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('h');
                    return Promise.resolve(pages);
                },
                function(pages){
                    pages.push('i');
                    return Promise.resolve(pages);
                }
            ]
        ]);

        promise.then(function(pages){

            assert.deepEqual(pages, [['a','b','c'],['d','e','f'],['g','h','i']]);

            done();
        });
    });
});
