var _ = require('../bin/squishy-pants');

exports.promise = {
    testPromise: function(test) {
        var expected = _.success(41),
            promise = _.Promise(function(resolve) {
                resolve(expected);
            });

        promise.fork(function(data) {
            test.deepEqual(data, expected);
        });

        test.expect(1);
        test.done();
    },
    testMultipleFork: function(test) {
        var expected = _.success(41),
            total = 10,
            i,
            promise = _.Promise(function(resolve) {
                resolve(expected);
            });

        function testCase(promise) {
            promise.fork(function(data) {
                test.deepEqual(data, expected);
            });
        }

        for (i = 0; i < total; i++) {
            testCase(promise);
        }

        test.expect(total);
        test.done();
    },
    testDeferredCalledOnce: function(test) {
        var promise = _.Promise(function(resolve) {
            test.ok(true);
            resolve(_.success(41));
        });
        promise.fork(function() {});
        promise.fork(function() {});
        test.expect(1);
        test.done();
    },
    testDeferredCalledOnceWithAsyncResolve: function(test) {
        var expected = _.success(41),
            promise = _.Promise(function(resolve) {
                test.ok(true);
                setTimeout(function() {
                    resolve(expected);
                }, 50);
            });

        function testCase(promise) {
            promise.fork(function(data) {
                test.deepEqual(data, expected);
            });
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
        _.Promise.of(1).fork(
            function(data) {
                test.deepEqual(data, _.success(1));
            }
        );
        test.expect(1);
        test.done();
    }
};
