var _ = require('./lib/test');

exports.FailureReporter = {
    testFailureReporterWithInput: _.check(
        function(a) {
            return _.FailureReporter(a, 0).inputs === a;
        },
        [_.arrayOf(String)]
    ),
    testFailureReporterWithTries: _.check(
        function(a) {
            return _.FailureReporter([''], a).tries === a;
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