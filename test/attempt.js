var _ = require('./lib/test');

exports.testAttemptMatch = {
    testSuccessMatch: function(test) {
        var a = _.success(1);
        a.match({
            success: function(data) {
                test.equal(data, 1);
            },
            failure: function(errors) {
                test.fail('Failed if called');
            }
        });
        test.expect(1);
        test.done();
    },
    testFailureMatch: function(test) {
        var a = _.failure(['failure']);
        a.match({
            success: function(data) {
                test.fail('Failed if called');
            },
            failure: function(errors) {
                test.deepEqual(errors, ['failure']);
            }
        });
        test.expect(1);
        test.done();
    }
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