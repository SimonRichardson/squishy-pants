var _ = require('../test/lib/test');

exports.do_macro = {
    'when testing do with one identity should return correct result': _.check(
        function(a) {
            var result = $do {
                x <- a
                = x
            };

            return _.expect(result).toBe(a);
        },
        [_.identityOf(_.AnyVal)]
    ),
    'when testing do with sum identity should return correct result': _.check(
        function(a) {
            var result = $do {
                x <- a
                = x + 1
            };

            return _.expect(result).toBe(_.Identity(a.x + 1));
        },
        [_.identityOf(Number)]
    ),
    'when testing do with multiple identities should return correct result': _.check(
        function(a, b) {
            var result = $do {
                x <- a
                y <- b
                = x + y
            };

            return _.expect(result).toBe(_.Identity(a.x + b.x));
        },
        [_.identityOf(Number), _.identityOf(Number)]
    )
};