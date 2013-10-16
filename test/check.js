var _ = require('./lib/test');

exports.failureReporter = {
    'when testing failureReporter with input should return correct value': _.check(
        function(a) {
            return _.failureReporter(a, 0).inputs === a;
        },
        [_.arrayOf(String)]
    ),
    'when testing failureReporter with input should return correct tries': _.check(
        function(a) {
            return _.failureReporter([''], a).tries === a;
        },
        [Number]
    )
};

exports.forAll = {
    'when testing forAll should return correct value': function(test) {
        var reporter = _.forAll(
            function(s) {
                return false;
            },
            [String]
        );
        test.ok(_.isOption(reporter));
        test.done();
    },
    'when testing forAll should return correct option': function(test) {
        var reporter = _.forAll(
            function(s) {
                return false;
            },
            [String]
        );
        test.ok(reporter.isSome);
        test.done();
    },
    'when testing forAll should return correct option': function(test) {
        var reporter = _.forAll(
            function(s) {
                return false;
            },
            [String]
        );
        test.ok(reporter.isSome);
        test.done();
    },
    'when testing forAll with success should return correct value': function(test) {
        var reporter = _.forAll(
            function(s) {
                return true;
            },
            [String]
        );
        test.ok(_.isOption(reporter));
        test.done();
    },
    'when testing forAll with success should return correct option': function(test) {
        var reporter = _.forAll(
            function(s) {
                return true;
            },
            [String]
        );
        test.ok(reporter.isNone);
        test.done();
    },
    'when testing forAll with failure should return correct inputs': function(test) {
        var index = 0,
            finder = [],
            reporter = _.forAll(
                function(s) {
                    if (++index > (this.goal / 2)) {
                        finder.push(s);
                        return false;
                    }
                    return true;
                },
                [String]
            );
        test.deepEqual(finder, reporter.get().inputs);
        test.done();
    }
};

exports.arb = {
    'when testing AnyVal should return correct value': _.check(
        function(a) {
            return _.isAnyTypeOf(['boolean', 'number', 'string'], a);
        },
        [_.AnyVal]
    ),
    'when testing Array should return correct value': _.check(
        function(a) {
            return _.isArray(a);
        },
        [Array]
    ),
    'when testing Boolean should return correct value': _.check(
        function(a) {
            return _.isBoolean(a);
        },
        [Boolean]
    ),
    'when testing Char should return correct value': _.check(
        function(a) {
            return _.isString(a) && !!(a.charCodeAt(0) >= 32 && a.charCodeAt(0) <= 255);
        },
        [_.Char]
    ),
    'when testing Integer should return correct value': _.check(
        function(a) {
            var m = Math.pow(2, 32) - 1;
            return _.isNumber(a) && !!(a >= -m && a <= m);
        },
        [_.Integer]
    ),
    'when testing Rand should return correct value': _.check(
        function(a) {
            return _.isNumber(a);
        },
        [_.Rand]
    ),
    'when testing Function should return correct value': _.check(
        function(a) {
            return _.isFunction(a);
        },
        [Function]
    ),
    'when testing isArrayOf should return correct value': _.check(
        function(a) {
            return _.isArray(a);
        },
        [_.arrayOf(Number)]
    ),
    'when testing isObjectLike should return correct value': _.check(
        function(a) {
            return _.isObject(a) && _.isNumber(a.a) && _.isString(a.b);
        },
        [_.objectLike({a: Number, b: String})]
    ),
    'when testing Number should return correct value': _.check(
        function(a) {
            return _.isNumber(a);
        },
        [Number]
    ),
    'when testing Object should return correct value': _.check(
        function(a) {
            return _.isObject(a);
        },
        [Object]
    ),
    'when testing String should return correct value': _.check(
        function(a) {
            return _.isString(a);
        },
        [String]
    )
};


exports.shrink = {
    'when testing shrink for Array should return correct value': function(test) {
        var a = [1, 2, 3, 4, 5, 6];
        test.deepEqual(_.shrink(a), [[], [1, 2, 3], [1, 2, 3, 4, 5]]);
        test.done();
    },
    'when testing shrink for Boolean true should return correct value': function(test) {
        var a = true;
        test.deepEqual(_.shrink(a), [false]);
        test.done();
    },
    'when testing shrink for Boolean false should return correct value': function(test) {
        var a = false;
        test.deepEqual(_.shrink(a), [true]);
        test.done();
    },
    'when testing shrink for Number should return correct value': function(test) {
        var a = 1000;
        test.deepEqual(_.shrink(a), [0, 500, 750, 875, 938, 969, 985, 993, 997, 999]);
        test.done();
    },
    'when testing shrink for negative Number should return correct value': function(test) {
        var a = -1000;
        test.deepEqual(_.shrink(a), [0, -500, -750, -875, -938, -969, -985, -993, -997, -999]);
        test.done();
    },
    'when testing shrink for String should return correct value': function(test) {
        var a = 'abcdefghi';
        test.deepEqual(_.shrink(a), ['', 'abcde', 'abcdefg', 'abcdefgh']);
        test.done();
    },
    'when testing shrink for Object should return correct value': function(test) {
        var a = {};
        test.deepEqual(_.shrink(a), []);
        test.done();
    }
};