var _ = require('./lib/test'),
    reverse = function(s) {
        return s.split('').reverse().join('');
    };

exports.failureReporter = {
    testFailureReporterWithInput: _.check(
        function(a) {
            return _.failureReporter(a, 0).inputs === a;
        },
        [_.arrayOf(String)]
    ),
    testFailureReporterWithTries: _.check(
        function(a) {
            return _.failureReporter([''], a).tries === a;
        },
        [Number]
    )
};

exports.forAll = {
    testResultIsSome: function(test) {
        var reporter = _.forAll(
            function(s) {
                return false;
            },
            [String]
        );
        test.ok(_.isOption(reporter));
        test.ok(reporter.isSome);
        test.done();
    },
    testResultIsNone: function(test) {
        var reporter = _.forAll(
            function(s) {
                return true;
            },
            [String]
        );
        test.ok(_.isOption(reporter));
        test.ok(reporter.isNone);
        test.done();
    }
};