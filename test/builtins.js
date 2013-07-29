var _ = require('./lib/test');

exports.empty = {
    testAnyVal: function(test) {
        var isAnyOf = _.isAnyTypeOf(['boolean', 'number', 'string']);
        test.ok(isAnyOf(_.empty(_.AnyVal)));
        test.done();
    },
    testArray: function(test) {
        test.ok(_.isInstanceOf(Array, _.empty(Array)));
        test.done();
    },
    testBoolean: function(test) {
        test.ok(_.isTypeOf('boolean', _.empty(Boolean)));
        test.done();
    },
    testFunction: function(test) {
        test.ok(_.isTypeOf('function', _.empty(Function)));
        test.done();
    },
    testNumber: function(test) {
        test.ok(_.isTypeOf('number', _.empty(Number)));
        test.done();
    },
    testObject: function(test) {
        test.ok(_.isTypeOf('object', _.empty(Object)));
        test.done();
    },
    testString: function(test) {
        test.ok(_.isTypeOf('string', _.empty(String)));
        test.done();
    }
};

exports.equal = {
    'when testing equal with Boolean should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Boolean]
    ),
    'when testing equal with Function should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Function]
    ),
    'when testing equal with Number should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Number]
    ),
    'when testing equal with String should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [String]
    ),
    'when testing equal with Array should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing equal with Object should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Object]
    )
};

exports.expect = {
    'when testing expect with Boolean should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Boolean]
    ),
    'when testing expect with Function should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Function]
    ),
    'when testing expect with Number should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Number]
    ),
    'when testing expect with String should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [String]
    ),
    'when testing expect with Array should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing expect with Object should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Object]
    )
};