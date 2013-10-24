var _ = require('./../lib/test');

exports.identityT = {
    'when testing identityT should return correct value': _.check(
        function(a) {
            var x = _.Identity.IdentityT(_.Identity),
                y = x.of(a).map(_.inc);

            return _.expect(y.run).toBe(_.Identity(a + 1));
        },
        [_.Integer]
    ),
    'when testing identityT ap should return correct value': _.check(
        function(a) {
            var transformer = _.Identity.IdentityT(_.Identity),
                actual = transformer(_.Identity(_.inc)).ap(transformer(_.Identity(a)));

            return _.expect(actual.run).toBe(_.Identity(a + 1));
        },
        [_.AnyVal]
    ),
    'when testing identityT map should return correct value': _.check(
        function(a) {
            var transformer = _.Identity.IdentityT(_.Identity),
                actual = transformer(_.Identity(a)).map(_.inc);

            return _.expect(actual.run).toBe(_.Identity(a + 1));
        },
        [_.AnyVal]
    ),
    'when testing identityT chain should return correct value': _.check(
        function(a, b) {
            var transformer = _.Identity.IdentityT(_.Identity),
                actual = transformer(_.Identity(a)).chain(
                    function() {
                        return transformer(_.Identity(b));
                    }
                );

            return _.expect(actual.run).toBe(_.Identity(b));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a identityT and using chain should be correct value': _.check(
        function(a, b) {
            var transformer = _.Identity.IdentityT(_.Identity);

            return _.expect(
                transformer(_.Identity.of(b)).chain(function(x) {
                    return _.Identity.IdentityT(_.Identity.of(1)).of(x + 1);
                }).run
            ).toBe(_.Identity.of(b + 1));
        },
        [Number, Number]
    ),
    'when creating a identityT using identityTOf and chain should be correct value': _.check(
        function(a, b) {
            return _.expect(
                a(_.Identity.of(b)).chain(function(x) {
                    return _.Identity.IdentityT(_.Identity.of(1)).of(x + 1);
                }).run
            ).toBe(_.Identity.of(b + 1));
        },
        [_.identityTOf(_.identityOf(Number)), Number]
    ),
    'when creating a identityT using identityTOf and map should be correct value': _.check(
        function(a, b) {
            return _.expect(
                _.map(
                    a(_.Identity.of(b)),
                    function(x) {
                        return x + 1;
                    }
                ).run
            ).toBe(_.Identity.of(b + 1));
        },
        [_.identityTOf(_.identityOf(Number)), Number]
    )
};