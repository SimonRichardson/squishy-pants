var _ = require('./lib/test');

exports.identity = {
    'when testing identity arguments should return correct value': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [_.Identity]
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
    )
};

exports.identityT = {
    'when testing identityT ap should return correct value': _.check(
        function(a) {
            var identityT = _.Identity.IdentityT(_.Identity(_.inc)),
                actual = identityT(_.Identity(a)).map(_.inc),
                expected = identityT(_.Identity(a + 1));

            return _.expect(actual).toBe(expected);
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
    )
};