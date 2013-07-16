var _ = require('../bin/squishy-pants');

exports.promise = {
    testPromise: function(test) {
        var expected = 42;
        var promise = new _.Promise(function(resolve, reject) {
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
        promise.fork(
            function(data) {
                test.equal(data, expected);
            },
            function(error) {
                test.fail('Failed if called');
            }
        );
        test.expect(2);
        test.done();
    }
};