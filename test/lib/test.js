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
                    return 'Failed after ' + fail.tries + ' tries: ' + fail.inputs.toString();
                },
                function() {
                    return 'OK';
                }
            ));
        });

        test.done();
    }))
    .property('checkStream', _.curry(function(property, args, test) {
        var env = this,
            failures = [],
            expected = 0,
            inputs,
            applied,
            i,
            check = env.curry(function(state, inputs, index, result) {
                state(
                    !result ?
                    env.Some(
                        _.failureReporter(
                            inputs,
                            index + 1
                        )
                    ) :
                    env.None
                );
            }),
            reporter = function(report) {
                failures.push({
                    valid: report.isNone,
                    msg: report.fold(
                        function(fail) {
                            return 'Failed after ' + fail.tries + ' tries: ' + fail.inputs.toString();
                        },
                        function() {
                            return 'OK';
                        }
                    )
                });
            },
            checkDone = function() {
                return function() {
                    test.ok(true, 'OK');
                };
            },
            add = function() {
                expected = _.inc(expected);
            },
            nothing = function() {};

        for(i = 0; i < env.goal; i++) {
            inputs = env.generateInputs(env, args, i);
            applied = property.apply(this, inputs);
            applied.fork(check(reporter, inputs, i), checkDone());
            applied.length().fork(add, nothing);
        }

        var valid = _.fold(failures, true, function(a, b) {
                return a && b.valid;
            }),
            words = valid ? 'OK' : _.fold(failures, '', function(a, b) {
                return b.valid ? a : a + '\n' + b.msg;
            });

        // FIXME: This should only call checkDone once.
        test.expect(expected + 1);
        test.ok(valid, words);
        test.done();
    }))
    .property('badLeft', _.error("Got Left side"))
    .property('badRight', _.error("Got Right side"));

exports = module.exports = _;