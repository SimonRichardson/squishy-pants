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
    testSuccess: _.check(
        function(a) {
            return _.success(a).value === a;
        },
        [_.AnyVal]
    ),
    testSuccessIsAttempt: _.check(
        function(a) {
            return _.isAttempt(_.success(a));
        },
        [_.AnyVal]
    ),
    testSuccessIsSuccess: _.check(
        function(a) {
            return _.success(a).isSuccess;
        },
        [_.AnyVal]
    ),
    testSuccessIsNotFailure: _.check(
        function(a) {
            return !_.success(a).isFailure;
        },
        [_.AnyVal]
    )
};

exports.testAttemptFailure = {
    testFailure: _.check(
        function(a) {
            return _.failure(a).errors === a;
        },
        [_.AnyVal]
    ),
    testFailureIsAttempt: _.check(
        function(a) {
            return _.isAttempt(_.failure(a));
        },
        [_.AnyVal]
    ),
    testFailureIsFailure: _.check(
        function(a) {
            return _.failure(a).isFailure;
        },
        [_.AnyVal]
    ),
    testFailureIsNotSuccess: _.check(
        function(a) {
            return !_.failure(a).isSuccess;
        },
        [_.AnyVal]
    )
};