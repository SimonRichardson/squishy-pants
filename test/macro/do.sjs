var _ = require('../test/lib/test');

exports.do_macro = {
    'when testing do with one identity should return correct result': _.check(
        function(a) {
            var result = $do {
                x <- a
                return x
            };

            return _.expect(result).toBe(a);
        },
        [_.identityOf(_.AnyVal)]
    ),
    'when testing do with sum identity should return correct result': _.check(
        function(a) {
            var result = $do {
                x <- a
                return x + 1
            };

            return _.expect(result).toBe(_.Identity(a.x + 1));
        },
        [_.identityOf(String)]
    ),
    'when testing do with multiple identities should return correct result': _.check(
        function(a, b) {
            var result = $do {
                x <- a
                y <- b
                return x + y
            };

            return _.expect(result).toBe(_.Identity(a.x + b.x));
        },
        [_.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with multiple identities with const should return correct result': _.check(
        function(a, b, c) {
            var result = $do {
                x <- a
                g = c
                y <- b
                return x + y + g
            };

            return _.expect(result).toBe(_.Identity(a.x + b.x + c));
        },
        [_.identityOf(String), _.identityOf(String), String]
    ),
    'when testing do with multiple identities with const should return correct result': _.check(
        function(a, b, c, d) {
            var result = $do {
                x <- a
                g = c
                h = d
                y <- b
                return x + y + g + h
            };

            return _.expect(result).toBe(_.Identity(a.x + b.x + c + d));
        },
        [_.identityOf(String), _.identityOf(String), String, String]
    )
};