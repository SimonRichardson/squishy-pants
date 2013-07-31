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
    .property('checkStream', _.curry(function(property, args, delay, test) {
        var env = this,
            check,
            reporter,
            applied,
            inputs,
            i;

        check = env.curry(function(state, index, result) {
            state(
                !result ?
                env.Some(_.failureReporter(
                    inputs,
                    index + 1
                )) :
                env.None
            );
        });

        reporter = function(report) {
            test.ok(report.isNone, report.fold(
                function(fail) {
                    return 'Failed after ' + fail.tries + ' tries: ' + fail.inputs.toString();
                },
                function() {
                    return 'OK';
                }
            ));
        };

        for(i = 0; i < env.goal; i++) {
            inputs = env.generateInputs(env, args, i);
            applied = property.apply(this, inputs);
            applied.foreach(check(reporter, i));
        }

        setTimeout(function() {
            test.done();
        }, delay || 1);
    }))
    .property('badLeft', _.error("Got Left side"))
    .property('badRight', _.error("Got Right side"));

exports = module.exports = _;