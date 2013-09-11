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
    ),
    'when testing do with entering if should return correct result': _.check(
        function(a, b, c) {
            var result = $do {
                x <- a
                if (x === a.x) {
                    z <- c
                    return z
                }
                y <- b
                return x + y
            };

            return _.expect(result).toBe(_.Identity(c.x));
        },
        [_.identityOf(String), _.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with bypassing if should return correct result': _.check(
        function(a, b, c) {
            var result = $do {
                x <- a
                if (x === {}) {
                    z <- c
                    return z
                }
                y <- b
                return x + y
            };

            return _.expect(result).toBe(_.Identity(a.x + b.x));
        },
        [_.identityOf(String), _.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with entering if without anymore statements should return correct result': _.check(
        function(a, b) {
            var result = $do {
                x <- a
                if (x === a.x) {
                    z <- b
                    return z
                }
            };

            return _.expect(result).toBe(_.Identity(b.x));
        },
        [_.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with bypassing if without anymore statements should return correct result': _.check(
        function(a, b) {
            var result = $do {
                x <- a
                if (x === {}) {
                    z <- b
                    return z
                }
            };

            return _.expect(result).toBe(null);
        },
        [_.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with entering if...else without anymore statements should return correct result': _.check(
        function(a, b, c) {
            var result = $do {
                x <- a
                if (x === a.x) {
                    z <- b
                    return z
                } else {
                    z <- c
                    return z
                }
            };

            return _.expect(result).toBe(_.Identity(b.x));
        },
        [_.identityOf(String), _.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with bypassing if...else without anymore statements should return correct result': _.check(
        function(a, b, c) {
            var result = $do {
                x <- a
                if (x === {}) {
                    z <- b
                    return z
                } else {
                    z <- c
                    return z
                }
            };

            return _.expect(result).toBe(_.Identity(c.x));
        },
        [_.identityOf(String), _.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with entering if...elseif without anymore statements should return correct result': _.check(
        function(a, b, c) {
            var result = $do {
                x <- a
                if (x === {}) {
                    z <- b
                    return z
                } else if (x === a.x) {
                    z <- c
                    return z
                }
            };

            return _.expect(result).toBe(_.Identity(c.x));
        },
        [_.identityOf(String), _.identityOf(String), _.identityOf(String)]
    ),
    'when testing do with entering if...elseif...else without anymore statements should return correct result': _.check(
        function(a, b, c, d) {
            var result = $do {
                x <- a
                if (x === {}) {
                    z <- b
                    return z
                } else if (x === a.x) {
                    z <- c
                    return z
                } else {
                    z <- d
                    return z
                }
            };

            return _.expect(result).toBe(_.Identity(c.x));
        },
        [_.identityOf(String), _.identityOf(String), _.identityOf(String), _.identityOf(String)]
    )
};