var _ = require('./lib/test');

exports.fo = {
    'when testing fo with `>=` chaining values and getting correct value': _.check(
        function(a) {
            return _.expect(
                    _.fo()(
                        _.Identity(a) >= _.wrap(function(x) {
                            return _.Identity(x + 1);
                        })
                    )
                ).toBe(_.Identity(a + 1));
        },
        [Number]
    ),
    'when testing fo with `>>` andThen should get correct value': _.check(
        function(a, b) {
            return _.expect(
                    _.fo()(
                        _.wrap(_.add(a)) >> _.wrap(_.times(2)) >> _.wrap(_.add(3))
                    )(b)
                ).toBe(((a + b) * 2) + 3);
        },
        [Number, Number]
    ),
    'when testing fo with `<<` compose should get correct value': _.check(
        function(a, b) {
            return _.expect(
                    _.fo()(
                        _.wrap(_.add(a)) << _.wrap(_.times(2)) << _.wrap(_.add(3))
                    )(b)
                ).toBe(((3 + b) * 2) + a);
        },
        [Number, Number]
    ),
    'when testing fo with `*` applicative should get correct value': _.check(
        function(a, b) {
            return _.expect(
                    _.fo()(
                        _.Identity(_.add) * _.Identity(a) * _.Identity(b)
                    )
                ).toBe(_.Identity(a + b));
        },
        [Number, Number]
    ),
    'when testing fo with `+` concat should get correct value': _.check(
        function(a, b, c) {
            return _.expect(
                    _.fo()(
                        _.Identity(a) + _.Identity(b) + _.Identity(c)
                    )
                ).toBe(_.Identity(a + b + c));
        },
        [Number, Number, Number]
    ),
    'when testing fo with `%` functor map should get correct value': _.check(
        function(a, b, c) {
            return _.expect(
                    _.fo()(
                        _.Identity(a) % _.wrap(_.add(b)) % _.wrap(_.add(c))
                    )
                ).toBe(_.Identity(a + b + c));
        },
        [Number, Number, Number]
    ),
    'when testing fo with `-` negate should get correct value': _.check(
        function(a, b) {
            return _.expect(
                    _.fo()(
                        _.Identity(a) - _.Identity(b)
                    )
                ).toBe(_.Identity(a - b));
        },
        [Number, Number]
    ),
    'when testing fo with `<` monad sequence should get correct value': _.check(
        function(a, b) {
            return _.expect(
                    _.fo()(
                        _.Identity(a) < _.Identity(b)
                    )
                ).toBe(_.Identity(b));
        },
        [Number, Number]
    )
};