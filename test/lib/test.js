var _ = require('../../bin/squishy-pants'),
    NonEmptyChar = {},
    NonEmptyAlphaChar = {},
    NumericOrAlphaChar = {},
    Add = {},
    Div = {},
    Min = {},
    Mul = {},
    AddInvalid = {},
    DivInvalid = {},
    MinInvalid = {},
    MulInvalid = {},
    Branch = {},
    BranchInvalid = {},
    NumberOrInvalid = {},
    Generate = {},
    GenerateInvalid = {};

function statement(a, b, c) {
    return '(' + a + ' ' + b + ' ' + c + ')';
}

_ = _
    .property('xcheck', function(){
        return function(test) {
            console.log('Next test disabled via `xcheck`, skipping...');
            test.done();
        };
    })
    .property('check', _.curry(function(property, args, test) {
        var report = this.forAll(property, args);

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
        var env = this,
            length = env.functionLength(type);
        env.fill(length)(env.identity).forEach(function (value, index) {
            function property() {
                return access(type.apply(this, arguments), index) === arguments[index];
            }
            property._length = length;

            var report = env.forAll(property, args);
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
                        env.failureReporter(
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

        var valid = env.fold(failures, true, function(a, b) {
                return a && b.valid;
            }),
            words = valid ? 'OK' : env.fold(failures, '', function(a, b) {
                return b.valid ? a : a + '\n' + b.msg;
            });

        test.expect(env.goal + 1);
        test.ok(valid, words);
        test.done();
    }))

    // Either related
    .property('badLeft', _.error("Got Left side"))
    .property('badRight', _.error("Got Right side"))

    // Character related
    .property('NonEmptyChar', NonEmptyChar)
    .method('arb', _.strictEquals(NonEmptyChar), function(a, s) {
        var blacklist = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 127, 129, 141, 143, 144, 157, 160, 173],
            rnd = this.randomIntRangeWithout(33, 255, blacklist);
        return String.fromCharCode(rnd);
    })
    .property('NonEmptyAlphaChar', NonEmptyAlphaChar)
    .method('arb', _.strictEquals(NonEmptyAlphaChar), function(a, s) {
        var blacklist = [91, 92, 93, 94, 95, 96],
            rnd = this.randomIntRangeWithout(65, 122, blacklist);
        return String.fromCharCode(rnd);
    })
    .property('NumericOrAlphaChar', NumericOrAlphaChar)
    .method('arb', _.strictEquals(NumericOrAlphaChar), function(a, s) {
        var blacklist = [58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96],
            rnd = this.randomIntRangeWithout(48, 122, blacklist);
        return String.fromCharCode(rnd);
    })

    // Parser related
    .property('Add', Add)
    .method('arb', _.strictEquals(Add), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);

        return statement('add', x, y);
    })
    .property('Div', Div)
    .method('arb', _.strictEquals(Div), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);
        return statement('div', x, y);
    })
    .property('Min', Min)
    .method('arb', _.strictEquals(Min), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);
        return statement('min', x, y);
    })
    .property('Mul', Mul)
    .method('arb', _.strictEquals(Mul), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);
        return statement('mul', x, y);
    })
    .property('AddInvalid', AddInvalid)
    .method('arb', _.strictEquals(AddInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);

        return statement('add', x, y);
    })
    .property('DivInvalid', DivInvalid)
    .method('arb', _.strictEquals(DivInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);
        return statement('div', x, y);
    })
    .property('MinInvalid', MinInvalid)
    .method('arb', _.strictEquals(MinInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);
        return statement('min', x, y);
    })
    .property('MulInvalid', MulInvalid)
    .method('arb', _.strictEquals(MulInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);
        return statement('mul', x, y);
    })
    .property('Branch', Branch)
    .method('arb', _.strictEquals(Branch), function(a, b) {
        if (b <= 0 || _.randomRange(0, 1) < 0.5) {
            return _.arb(Number, b - 1);
        }
        return this.arb(Generate, b - 1);
    })
    .property('BranchInvalid', BranchInvalid)
    .method('arb', _.strictEquals(BranchInvalid), function(a, b) {
        if (b <= 0 || _.randomRange(0, 1) < 0.5) {
            return this.arb(NumberOrInvalid, b - 1);
        }
        return this.arb(GenerateInvalid, b - 1);
    })
    .property('NumberOrInvalid', NumberOrInvalid)
    .method('arb', _.strictEquals(NumberOrInvalid), function(a, b) {
        if(_.randomRange(0, 1) < 0.5) {
            return '/';
        }
        return _.arb(Number, b - 1);
    })
    .property('Generate', Generate)
    .method('arb', _.strictEquals(Generate), function(a, b) {
        var types = [Add, Mul, Div, Min],
            value = this.arb(_.oneOf(types), b - 1);
        return value;
    })
    .property('GenerateInvalid', GenerateInvalid)
    .method('arb', _.strictEquals(GenerateInvalid), function(a, b) {
        var types = [AddInvalid, MulInvalid, DivInvalid, MinInvalid],
            value = this.arb(_.oneOf(types), b - 1);
        return value;
    });

exports = module.exports = _;