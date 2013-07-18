var _ = require('../bin/squishy-pants');

exports.promise = {
    testPromise: function(test) {
        var expected = 41,
            promise = _.Promise(function(resolve, reject) {
                resolve(expected);
            });

        promise.fork(
            function(data) {
                test.equal(expected, data);
            },
            function(errors) {
                test.ok(false, 'Failed if called');
            }
        );

        test.expect(1);
        test.done();
    },
    testMultipleFork: function(test) {
        var expected = 41,
            total = 10,
            i,
            promise = _.Promise(function(resolve, reject) {
                resolve(expected);
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

        for (i = 0; i < total; i++) {
            testCase(promise);
        }

        test.expect(total);
        test.done();
    },
    testDeferredCalledOnce: function(test) {
        var promise = _.Promise(function(resolve, reject) {
            test.ok(true);
            resolve(41);
        });
        promise.fork(function() {}, function() {});
        promise.fork(function() {}, function() {});
        test.expect(1);
        test.done();
    },
    testDeferredCalledOnceWithAsyncResolve: function(test) {
        var expected = 41,
            promise = _.Promise(function(resolve, reject) {
                test.ok(true);

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
        testCase(promise);

        setTimeout(function() {
            testCase(promise);
        }, 80);
        setTimeout(function() {
            test.expect(4);
            test.done();
        }, 100);
    }
};

exports.promiseOf = {
    testPromiseOf: function(test) {
        _.Promise.of(41).fork(
            function(data) {
                test.equal(41, data);
            },
            function(errors) {
                test.ok(false, 'Failed if called');
            }
        );
        test.expect(1);
        test.done();
    }
};

exports.promiseError = {
    testPromiseError: function(test) {
        _.Promise.error('failed').fork(
            function(data) {
                test.ok(false, 'Failed if called');
            },
            function(errors) {
                test.equal('failed', errors);
            }
        );
        test.expect(1);
        test.done();
    }
};

exports.promiseChain = {
    testPromiseChainOf: function(test) {
        var promise = _.Promise.of(41).chain(
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
    },
    testPromiseChainError: function(test) {
        var promise = _.Promise.of(41).chain(
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
    }
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
