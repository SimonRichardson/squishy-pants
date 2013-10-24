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
    ),
    'when creating a identity and using lens get should be correct value': _.check(
        function(a) {
            return _.expect(_.Identity.lens().run(a).get()).toBe(a.x);
        },
        [_.identityOf(_.AnyVal)]
    ),
    'when using of should be correct value': _.check(
        function(a) {
            return _.expect(_.of(_.Identity, a)).toBe(_.Identity(a));
        },
        [_.AnyVal]
    ),
    'when using empty should be correct value': function(test) {
        test.ok(_.expect(_.empty(_.Identity)).toBe(_.Identity(null)));
        test.done();
    },
    'when using toArray should be correct value': _.check(
        function(a) {
            return _.expect(_.toArray(_.Identity(a))).toBe([a]);
        },
        [_.AnyVal]
    ),
    'when using shrink should be correct value': _.check(
        function(a) {
            return _.expect(_.shrink(_.Identity(a))).toBe([]);
        },
        [_.AnyVal]
    )
};
