var _ = require('./lib/test');

exports.promise = {
    'testing promise should return the correct result': _.check(
        function(a) {
            var promise = _.Promise(
                function(resolve, reject) {
                    return resolve(a);
                }
            );
            return promise.fork(
                function(data) {
                    return _.expect(data).toBe(a);
                },
                function(errors) {
                    _.error('Failed if called');
                }
            );
        },
        [_.AnyVal]
    ),
    'testing promise with multiple forks should return the correct result': _.check(
        function(a) {
            var promise = _.Promise(
                    function(resolve, reject) {
                        return resolve(a);
                    }
                ),
                val = true,
                total = 10,
                i;

            function testCase(promise) {
                return promise.fork(
                    function(data) {
                        return _.expect(data).toBe(a);
                    },
                    function(errors) {
                        _.error('Failed if called');
                    }
                );
            }

            for(i = 0; i < total; i++) {
                val = val && testCase(promise);
            }

            return val;
        },
        [_.AnyVal]
    ),
    'test deferred is called twice when fork is called': _.check(
        function(a) {
            var called = 0;
                promise = _.Promise(function(resolve, reject) {
                called += 1;
                resolve(a);
            });
            promise.fork(function() {}, function() {});
            promise.fork(function() {}, function() {});
            return called === 2;
        },
        [_.AnyVal]
    ),
    'test deferred is called 2 times when fork is called async': function(test) {
        var expected = 41,
            promise = _.Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(expected);
                }, 50);
            });

        function testCase(promise) {
            promise.fork(
                function(data) {
                    test.equal(expected, data);
                },
                function(errors) {
                    test.ok(false, 'Failed if called');
                }
            );
        }

        testCase(promise);

        setTimeout(function() {
            testCase(promise);
        }, 40);
        setTimeout(function() {
            test.expect(2);
            test.done();
        }, 100);
    },
    'testing of with fork should return correct value': _.check(
        function(a) {
            return _.Promise.of(a).fork(
                function(b) {
                    return _.expect(b).toBe(a);
                },
                function(errors) {
                    _.error('Failed if called');
                }
            );
        },
        [_.AnyVal]
    ),
    'testing error with fork should return correct value': _.check(
        function(a) {
            return _.Promise.error(a).fork(
                function(errors) {
                    _.error('Failed if called');
                },
                function(b) {
                    return _.expect(b).toBe(a);
                }
            );
        },
        [_.AnyVal]
    ),
    'when using chaining promises together the promises should chain correctly': _.check(
        function(a) {
            return _.Promise.of(a).chain(
                    function(a) {
                        return _.Promise.of(a + 1);
                    }
                ).fork(
                    function(b) {
                        return _.expect(b).toBe(a + 1);
                    },
                    function(errors) {
                        _.error('Failed if called');
                    }
                );
        },
        [Number]
    ),
    'when using chaining promises together and one has an error the promises should chain correctly': _.check(
        function(a) {
            return _.Promise.of(a).chain(
                    function(a) {
                        return _.Promise.error(a + 1);
                    }
                ).fork(
                    function(errors) {
                        _.error('Failed if called');
                    },
                    function(b) {
                        return _.expect(b).toBe(a + 1);
                    }
                );
        },
        [Number]
    )
};

exports.promiseReject = {
    testPromiseRejectError: function(test) {
        var promise = _.Promise.error(41).reject(
            function(a) {
                return _.Promise.error(a + 1);
            }
        );
        promise.fork(
            function(data) {
                test.ok(false, 'Failed if called');
            },
            function(errors) {
                test.equal(42, errors);
            }
        );
        test.expect(1);
        test.done();
    },
    testPromiseRejectOf: function(test) {
        var promise = _.Promise.error(41).reject(
            function(a) {
                return _.Promise.of(a + 1);
            }
        );
        promise.fork(
            function(data) {
                test.equal(42, data);
            },
            function(errors) {
                test.ok(false, 'Failed if called');
            }
        );
        test.expect(1);
        test.done();
    }
};
