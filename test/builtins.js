var _ = require('./lib/test');

exports.empty = {
    'when testing empty with AnyVal (boolean, number, string) should return any type': function(test) {
        var isAnyOf = _.isAnyTypeOf(['boolean', 'number', 'string']);
        test.ok(isAnyOf(_.empty(_.AnyVal)));
        test.done();
    },
    'when testing creating empty Array should return instanceof Array': function(test) {
        test.ok(_.isInstanceOf(Array, _.empty(Array)));
        test.done();
    },
    'when testing creating empty Boolean should return instanceof Boolean': function(test) {
        test.ok(_.isTypeOf('boolean', _.empty(Boolean)));
        test.done();
    },
    'when testing creating empty Function should return instanceof Function': function(test) {
        test.ok(_.isTypeOf('function', _.empty(Function)));
        test.done();
    },
    'when testing creating empty Number should return instanceof Number': function(test) {
        test.ok(_.isTypeOf('number', _.empty(Number)));
        test.done();
    },
    'when testing creating empty Object should return instanceof Object': function(test) {
        test.ok(_.isTypeOf('object', _.empty(Object)));
        test.done();
    },
    'when testing creating empty String should return instanceof String': function(test) {
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
    ),
    'when testing equal with Boolean should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Boolean, String]
    ),
    'when testing equal with Function should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Function, String]
    ),
    'when testing equal with Number should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Number, String]
    ),
    'when testing equal with String should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [String, Array]
    ),
    'when testing equal with Array should not return true': _.check(
        function(a, b) {
            /* If a and b is length of zero then it'll return true */
            if (a.length === 0 && a.length === b.length) return true;

            return _.not(_.equal(a, b));
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(Object)]
    ),
    'when testing equal with Object should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Object, String]
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
    ),
    'when testing expect with Boolean should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Boolean, String]
    ),
    'when testing expect with Function should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Function, String]
    ),
    'when testing expect with Number should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Number, String]
    ),
    'when testing expect with String should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [String, Array]
    ),
    'when testing expect with Array should not return true': _.check(
        function(a, b) {
            /* If a and b is length of zero then it'll return true */
            if (a.length === 0 && a.length === b.length) return true;

            return _.not(_.expect(a).toBe(b));
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(Object)]
    ),
    'when testing expect with Object should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Object, String]
    )
};