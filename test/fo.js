var _ = require('./lib/test');

exports.fo = {
    'when testing unsafeSetValueOf with foQueue is unset show correct value': function(test) {
        var A = function() {};
        _.fo.unsafeSetValueOf(A.prototype);
        var a = new A();
        test.deepEqual(a.valueOf(), a);
        test.done();
    },
    'when testing fo without passing arguments throws correct error': function(test) {
        var msg = '';
        try {
            _.fo(1, 2);
        } catch(e) {
            msg = e.message;
        }
        test.ok(msg === 'Expecting no arguments given to fo. Use fo()(arguments)');
        test.done();
    },
    'when testing fo with passing arguments returns correct value': _.check(
        function(a) {
            return _.expect(
                    _.fo()(a)
                ).toBe(a);
        },
        [Number]
    ),
    'when testing fo with `/` chaining values throws the correct error': _.check(
        function(a) {
            var msg = '';
            try {
                    _.fo()(
                        _.Identity(a) / _.Box(function(x) {
                            return _.Identity(x + 1);
                        })
                    )
            } catch(e) {
                msg = e.message;
            }
            return _.expect(msg).toBe('Couldn\'t determine operation. Has fo.unsafeSetValueOf been called for all operands?');
        },
        [Number]
    ),
    'when testing fo with `>=` chaining values and getting correct value': _.check(
        function(a) {
            return _.expect(
                    _.fo()(
                        _.Identity(a) >= _.Box(function(x) {
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
                        _.Box(_.add(a)) >> _.Box(_.times(2)) >> _.Box(_.add(3))
                    )(b)
                ).toBe(((a + b) * 2) + 3);
        },
        [Number, Number]
    ),
    'when testing fo with `<<` compose should get correct value': _.check(
        function(a, b) {
            return _.expect(
                    _.fo()(
                        _.Box(_.add(a)) << _.Box(_.times(2)) << _.Box(_.add(3))
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
                        _.Identity(a) % _.Box(_.add(b)) % _.Box(_.add(c))
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