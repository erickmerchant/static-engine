var assert = require('chai').assert;
var engine = require('../index.js');

describe('engine', function(){

    it('should accept multiple arguments, each a plugin', function(done) {

        engine(
            function(pages, resolve){
                pages.push('a');
                resolve(null, pages);
            },
            function(pages, resolve){
                pages.push('b');
                resolve(null, pages);
            },
            function(pages, resolve){
                pages.push('c');
                resolve(null, pages);
            }
        )
        .then(function(pages){

            assert.deepEqual(pages, [['a','b','c']]);

            done();
        })
        .catch(done);
    });

    it('should accept multiple arguments, each an array of plugins', function(done) {

        engine(
            [
                function(pages, resolve){
                    pages.push('a');
                    resolve(null, pages);
                },
                function(pages, resolve){
                    pages.push('b');
                    resolve(null, pages);
                },
                function(pages, resolve){
                    pages.push('c');
                    resolve(null, pages);
                }
            ],
            [
                function(pages, resolve){
                    pages.push('d');
                    resolve(null, pages);
                },
                function(pages, resolve){
                    pages.push('e');
                    resolve(null, pages);
                },
                function(pages, resolve){
                    pages.push('f');
                    resolve(null, pages);
                }
            ],
            [
                function(pages, resolve){
                    pages.push('g');
                    resolve(null, pages);
                },
                function(pages, resolve){
                    pages.push('h');
                    resolve(null, pages);
                },
                function(pages, resolve){
                    pages.push('i');
                    resolve(null, pages);
                }
            ]
        )
        .then(function(pages){

            assert.deepEqual(pages, [['a','b','c'],['d','e','f'],['g','h','i']]);

            done();
        })
        .catch(done);
    });
});
