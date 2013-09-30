var _ = require('../../bin/squishy-pants'),
    NonEmptyAlphaChar = {},
    NumericOrAlphaChar = {};

_ = _
    .property('xcheck', function(){
        return function(test) {
            console.log('Next test disabled via `xcheck`, skipping...');
            test.done();
        };
    })
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
            };

        for(i = 0; i < env.goal; i++) {
            inputs = env.generateInputs(env, args, i);
            applied = property.apply(this, inputs);
            applied.fork(check(reporter, inputs, i), checkDone());
        }

        var valid = _.fold(failures, true, function(a, b) {
                return a && b.valid;
            }),
            words = valid ? 'OK' : _.fold(failures, '', function(a, b) {
                return b.valid ? a : a + '\n' + b.msg;
            });

        test.expect(env.goal + 1);
        test.ok(valid, words);
        test.done();
    }))
    .property('badLeft', _.error("Got Left side"))
    .property('badRight', _.error("Got Right side"))
    .property('NonEmptyAlphaChar', NonEmptyAlphaChar)
    .method('arb', _.strictEquals(NonEmptyAlphaChar), function(a, s) {
        var blacklist = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 127, 129, 141, 143, 144, 157, 160, 173],
            rnd = _.randomIntRangeWithout(33, 255, blacklist);
        return String.fromCharCode(rnd);
    })
    .property('NumericOrAlphaChar', NumericOrAlphaChar)
    .method('arb', _.strictEquals(NumericOrAlphaChar), function(a, s) {
        var blacklist = [58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96],
            rnd = _.randomIntRangeWithout(48, 122, blacklist);
        return String.fromCharCode(rnd);
    });

exports = module.exports = _;