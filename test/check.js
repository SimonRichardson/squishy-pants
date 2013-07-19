var _ = require('./lib/test'),
    isPalindrome = function(s) {
        var total = s.length;
        if(total < 2) return true;
        if(s.charAt(0) !== s.charAt(total - 1)) return false;

        return isPalindrome(s.substr(1, total - 2));
    },
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
    testResultIsOption: function(test) {
        // The chances of an actual random palindrome is quite remote.
        var reporter = _.forAll(
            function(s) {
                return isPalindrome(s + reverse(s));
            },
            [String]
        );
        test.ok(_.isOption(reporter));
        test.ok(reporter.isNone);
        test.done();
    },
    testResultIsSome: function(test) {
        var reporter = _.forAll(
            function(s) {
                return reverse(reverse(s)) === s;
            },
            [String]
        );
        test.ok(reporter.isNone);
        test.done();
    }
};