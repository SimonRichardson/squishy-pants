var _ = require('./lib/test');

exports.io = {
    'when testing io against unsafePerform returns constant value': _.check(
        function(a) {
            return _.IO(_.constant(a)).unsafePerform() == a;
        },
        [_.AnyVal]
    ),
    'when testing ap with constant value should return mapped value': _.check(
        function(a) {
            return _.expect(_.IO(_.concat(1)).ap(_.IO.of(a)).unsafePerform()).toBe(a + 1);
        },
        [Number]
    ),
    'when testing chain with constant value should return mapped value': _.check(
        function(a) {
            return _.IO(_.constant(a)).chain(function(b) {
                return _.IO(_.constant(a == b));
            }).unsafePerform();
        },
        [_.AnyVal]
    ),
    'when testing map with constant value should return mapped value': _.check(
        function(a) {
            return _.expect(_.IO(_.constant(a)).map(function(b) {
                return b + 1;
            }).unsafePerform()).toBe(a + 1);
        },
        [Number]
    ),
    'when using of should be correct value': _.check(
        function(a) {
            return _.expect(_.of(_.IO, _.constant(a)).unsafePerform()()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using ap should be correct value': _.check(
        function(a) {
            var actual = _.ap(_.IO(_.concat(1)), _.IO.of(a)).unsafePerform(),
                expected = _.IO(_.concat(1)).ap(_.IO.of(a)).unsafePerform();
            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal]
    ),
    'when using chain should be correct value': _.check(
        function(a) {
            var actual = _.chain(_.IO(_.constant(a)), function(b) {
                    return _.IO(_.constant(b + 1));
                }).unsafePerform(),
                expected = _.IO(_.constant(a)).chain(function(b) {
                    return _.IO(_.constant(b + 1));
                }).unsafePerform();
            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal]
    )
};
