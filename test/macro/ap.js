var _ = require('./lib/test');

exports.ap_macro = {
    'applying ap should return the correct value': _.check(
        function(a, b) {
            var f = _.Identity(_.curry(function(x, y) {
                    return x + y;
                })),
                sum = $ap f(a, b);

            return _.expect(sum.value).toBe(a.value + b.value);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    ),
    'applying nesting ap should return the correct value': _.check(
        function(a, b) {
            var f = _.Identity(_.curry(function(x, y) {
                    return x + y;
                })),
                sum = $ap f(a, $ap f(a, b));

            return _.expect(sum.value).toBe(a.value + a.value + b.value);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    ),
    'applying nested parenthesizes ap should return the correct value': _.check(
        function(a, b) {
            var f = _.Identity(_.curry(function(x, y) {
                    return x + y;
                })),
                sum = $ap (f(a, b));

            return _.expect(sum.value).toBe(a.value + b.value);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    ),
    'applying inline ap should return the correct value': _.check(
        function(a, b) {
            var sum = $ap (_.Identity(_.curry(function(x, y) {
                    return x + y;
                })))(a, b);

            return _.expect(sum.value).toBe(a.value + b.value);
        },
        [_.identityOf(Number), _.identityOf(Number)]
    )
};