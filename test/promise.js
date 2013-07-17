var _ = require('../bin/squishy-pants');

exports.promise = {
    testPromise: function(test) {
        var expected = 42,
            promise = new _.Promise(function(resolve, reject) {
                resolve(expected);
            });

        promise.fork(
            function(data) {
                test.equal(data, expected);
            },
            function(error) {
                test.fail('Failed if called');
            }
        );

        test.expect(1);
        test.done();
    },
    testMultipleFork: function(test) {
        var expected = 42,
            total = 10,
            i,
            promise = new _.Promise(function(resolve, reject) {
                resolve(expected);
            });

        function testCase(promise) {
            promise.fork(
                function(data) {
                    test.equal(data, expected);
                },
                function(error) {
                    test.fail('Failed if called');
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
        var promise = new _.Promise(function(resolve, reject) {
            test.ok(true);
            resolve(42);
        });
        promise.fork(
            function() {},
            function() {}
        );
        promise.fork(
            function() {},
            function() {}
        );
        test.expect(1);
        test.done();
    },
    testDeferredCalledOnceWithAsyncResolve: function(test) {
        var expected = 42,
            promise = new _.Promise(function(resolve, reject) {
                test.ok(true);
                setTimeout(function() {
                    resolve(expected);
                }, 50);
            });

        function testCase(promise) {
            promise.fork(
                function(data) {
                    test.equal(data, expected);
                },
                function(error) {
                    test.fail('Failed if called');
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