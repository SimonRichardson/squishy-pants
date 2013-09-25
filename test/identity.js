var _ = require('./lib/test');

exports.identity = {
    'when testing identity arguments should return correct value': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [_.identityOf(_.AnyVal)]
    ),
    'when testing identity ap should return correct value': _.check(
        function(a) {
            return _.expect(_.Identity(_.inc).ap(_.Identity(a))).toBe(_.Identity(a + 1));
        },
        [Number]
    ),
    'when testing identity chain should return correct value': _.check(
        function(a) {
            return _.expect(_.Identity(a).chain(
                function(a) {
                    return _.Identity.of(a + 1);
                }
            )).toBe(_.Identity(a + 1));
        },
        [Number]
    ),
    'when testing identity map should return correct value': _.check(
        function(a) {
            return _.expect(_.Identity(a).map(_.inc)).toBe(_.Identity(a + 1));
        },
        [Number]
    ),
    'when creating a identity and using lens should be correct value': _.check(
        function(a, b) {
            return _.expect(_.Identity.lens().run(a).set(b)).toBe(_.Identity(b));
        },
        [_.identityOf(_.AnyVal), _.AnyVal]
    )
};

exports.identityT = {
    'when testing identityT ap should return correct value': _.check(
        function(a) {
            var monad = _.Identity(a),
                transformer = _.Identity.IdentityT(monad),
                actual = transformer(_.Identity(_.inc)).ap(transformer(monad));

            return _.expect(actual).toBe(transformer(_.Identity(a + 1)));
        },
        [_.AnyVal]
    ),
    'when testing identityT map should return correct value': _.check(
        function(a) {
            var identityT = _.Identity.IdentityT(_.Identity(a)),
                actual = identityT(_.Identity(a)).map(_.inc),
                expected = identityT(_.Identity(a + 1));

            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal]
    ),
    'when testing identityT chain should return correct value': _.check(
        function(a, b) {
            var identityT0 = _.Identity.IdentityT(_.Identity(a)),
                identityT1 = _.Identity.IdentityT(_.Identity(b)),
                actual = identityT0(_.Identity(a)).chain(
                    function() {
                        return identityT1(_.Identity(b));
                    }
                ),
                expected = identityT0(_.Identity(b));

            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a identityT and using chain should be correct value': _.check(
        function(a, b) {
            var monad = _.Identity.of(1),
                transformer = _.Identity.IdentityT(monad);

            return _.expect(
                transformer(_.Identity.of(b)).chain(function(x) {
                    return _.Identity.IdentityT(monad).of(x + 1);
                })
            ).toBe(_.Identity.IdentityT(monad).of(b + 1));
        },
        [Number, Number]
    ),
    'when creating a identityT using identityTOf and chain should be correct value': _.check(
        function(a, b) {
            return _.expect(
                a(_.Identity.of(b)).chain(function(x) {
                    return _.Identity.IdentityT(_.Identity.of(1)).of(x + 1);
                })
            ).toBe(_.Identity.IdentityT(_.Identity.of(1)).of(b + 1));
        },
        [_.identityTOf(Number), Number]
    ),
    'when creating a identityT using identityTOf and map should be correct value': _.check(
        function(a, b) {
            return _.expect(
                _.map(
                    a(_.Identity.of(b)),
                    function(x) {
                        return x + 1;
                    }
                )
            ).toBe(_.Identity.IdentityT(_.Identity.of(1)).of(b + 1));
        },
        [_.identityTOf(Number), Number]
    )
};