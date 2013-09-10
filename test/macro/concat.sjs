var _ = require('../test/lib/test');

exports.concat_macro = {
    'applying concat should return the correct value': _.check(
        function(a, b) {
            var sum = $concat (a + b);

            return _.expect(sum.x).toBe(a.x + b.x);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    ),
    'applying concat multiple times should return the correct value': _.check(
        function(a, b, c) {
            var sum = $concat (a + b + c);

            return _.expect(sum.x).toBe(a.x + b.x + c.x);
        },
        [_.identityOf(Number), _.identityOf(Number), _.identityOf(Number)]
    ),
    'applying right nested concat multiple times should return the correct value': _.check(
        function(a, b, c) {
            var sum = $concat ((a + b) + c);

            return _.expect(sum.x).toBe(a.x + b.x + c.x);
        },
        [_.identityOf(Number), _.identityOf(Number), _.identityOf(Number)]
    ),
    'applying left nested concat multiple times should return the correct value': _.check(
        function(a, b, c) {
            var sum = $concat (c + (a + b));

            return _.expect(sum.x).toBe(a.x + b.x + c.x);
        },
        [_.identityOf(Number), _.identityOf(Number), _.identityOf(Number)]
    ),
    'applying left and right nested concat multiple times should return the correct value': _.check(
        function(a, b, c, d) {
            var sum = $concat (c + (a + b) + d);

            return _.expect(sum.x).toBe(a.x + b.x + c.x + d.x);
        },
        [_.identityOf(Number), _.identityOf(Number), _.identityOf(Number), _.identityOf(Number)]
    )
};