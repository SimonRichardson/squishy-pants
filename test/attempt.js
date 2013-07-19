var _ = require('./lib/test');

exports.attemptMatch = {
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

exports.attempt = {
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
    ),
    testSuccessMap: _.check(
        function(a) {
            return _.success(a).map(function(x) {
                return x + 1;
            }).value === a + 1;
        },
        [Number]
    ),
    testSuccessFold: _.check(
        function(a) {
            return _.success(a).fold(
                function(x) {
                    return x + 1;
                },
                _.error('Failed if called')
            ) === a + 1;
        },
        [Number]
    ),
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
    ),
    testFailureMap: _.check(
        function(a) {
            return _.failure(a).map(
                _.error('Failed if called')
            ).errors === a;
        },
        [_.AnyVal]
    ),
    testFailureFold: _.check(
        function(a) {
            return _.failure(a).fold(
                _.error('Failed if called'),
                function(x) {
                    return x + 1;
                }
            ) === a + 1;
        },
        [Number]
    ),
    testSuccessSuccessAp: _.check(
        function(a, b) {
            return _.success(
                _.constant(a)
            ).ap(
                _.success(b),
                _.concat
            ).value === a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    testSuccessFailureAp: _.check(
        function(a, b) {
            return _.success(
                _.constant(a)
            ).ap(
                _.failure(b),
                _.concat
            ).errors.toString() === b.toString();
        },
        [_.AnyVal, _.arrayOf(_.AnyVal)]
    ),
    testFailureSuccessAp: _.check(
        function(a, b) {
            return _.failure(a).ap(
                _.success(b),
                _.concat
            ).errors.toString() === a.toString();
        },
        [_.arrayOf(_.AnyVal), _.AnyVal]
    ),
    testFailureFailureAp: _.check(
        function(a, b) {
            var errors = _.failure(a).ap(
                _.failure(b),
                _.concat
            ).errors;
            // FIXME (Simon) : Implement equals.
            return errors.toString() === a.concat(b).toString();
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    )
};
