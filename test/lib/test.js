var _ = require('../../bin/squishy-pants');

_ = _
    .property('check', _.curry(function(property, args, test) {
        var report = _.forAll(property, args);

        test.ok(report.isNone, report.fold(
            function(fail) {
                return 'Failed after ' + fail.tries + ' tries: ' + fail.inputs.toString;
            },
            function() {
                return 'OK';
            }
        ));
        test.done();
    }));

exports = module.exports = _;