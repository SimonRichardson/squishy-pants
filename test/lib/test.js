var _ = require('../../bin/squishy-pants');

_ = _
    .property('check', _.curry(function(property, args, test) {
        var report = _.forAll(property, args);

        test.ok(report.isNone, report.fold(
            function(fail) {
                return 'Failed after ' + fail.tries + ' tries: ' + fail.inputs.toString();
            },
            function() {
                return 'OK';
            }
        ));
        test.done();
    }))
    .property('checkTaggedArgs', _.curry(function(type, args, access, test) {
        // Go through and check all the tagged arguments.
        var length = _.functionLength(type);
        _.fill(length)(_.identity).forEach(function (value, index) {
            function property() {
                return access(type.apply(this, arguments), index) === arguments[index];
            }
            property._length = length;

            var report = _.forAll(property, args);
            test.ok(report.isNone, report.fold(
                function(fail) {
                    return "Failed after " + fail.tries + " tries: " + fail.inputs.toString();
                },
                function() {
                    return "OK";
                }
            ));
        });

        test.done();
    }))
    .property('badLeft', _.error("Got Left side"))
    .property('badRight', _.error("Got Right side"));

exports = module.exports = _;