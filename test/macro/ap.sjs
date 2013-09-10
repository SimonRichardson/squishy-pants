var _ = require('../test/lib/test');

exports.ap_macro = {
    'applying ap should return the correct value': _.check(
        function(a, b) {
            var f = _.Identity(_.curry(function(x, y) {
                    return x + y;
                })),
                sum = $ap f(a, b);

            return _.expect(sum.x).toBe(a.x + b.x);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    ),
    'applying nesting ap should return the correct value': _.check(
        function(a, b) {
            var f = _.Identity(_.curry(function(x, y) {
                    return x + y;
                })),
                sum = $ap f(a, $ap f(a, b));

            return _.expect(sum.x).toBe(a.x + a.x + b.x);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    ),
    'applying nested parenthesizes ap should return the correct value': _.check(
        function(a, b) {
            var f = _.Identity(_.curry(function(x, y) {
                    return x + y;
                })),
                sum = $ap (f(a, b));

            return _.expect(sum.x).toBe(a.x + b.x);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    ),
    'applying inline ap should return the correct value': _.check(
        function(a, b) {
            var sum = $ap (_.Identity(_.curry(function(x, y) {
                    return x + y;
                })))(a, b);

            return _.expect(sum.x).toBe(a.x + b.x);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    )
};