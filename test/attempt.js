var _ = require('./lib/test');

exports.testAttemptMatch = {
    testSuccessMatch: _.check(
        function(a) {
            return _.success(a).match({
                success: function(b) {
                    return a === b;
                },
                failure: function() {
                    return false;
                }
            });
        },
        [_.AnyVal]
    ),
    testFailureMatch: _.check(
        function(a) {
            return _.failure(a).match({
                success: function() {
                    return false;
                },
                failure: function(b) {
                    return a === b;
                }
            });
        },
        [String]
    )
};

exports.testAttemptSuccess = {
    testSuccess: function(test) {
        test.equal(_.success(1).value, 1);
        test.done();
    },
    testSuccessIsAttempt: function(test) {
        test.ok(_.isAttempt(_.success(1)));
        test.done();
    },
    testSuccessIsSuccess: function(test) {
        test.ok(_.success(1).isSuccess);
        test.done();
    },
    testSuccessNotIsFailure: function(test) {
        test.notEqual(_.success(1).isFailure);
        test.done();
    }
};

exports.testAttemptFailure = {
    testFailure: function(test) {
        test.deepEqual(_.failure(['failure']).errors, ['failure']);
        test.done();
    },
    testFailureIsAttempt: function(test) {
        test.ok(_.isAttempt(_.failure(1)));
        test.done();
    },
    testFailureIsFailure: function(test) {
        test.ok(_.failure(1).isFailure);
        test.done();
    },
    testFailureNotIsSuccess: function(test) {
        test.notEqual(_.failure(1).isSuccess);
        test.done();
    }
};