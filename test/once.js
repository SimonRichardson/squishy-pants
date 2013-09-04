var _ = require('./lib/test');

exports.once = {
    'when testing once with one argument should return correct value': _.check(
        function(a) {
            var once = _.once(
                function(a) {
                    return a;
                },
                a
            );
            return _.expect(once()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing once with multiple arguments should return correct value': _.check(
        function(a, b, c) {
            var once = _.once(
                function(a, b, c) {
                    return a + b + c;
                },
                a, b, c
            );
            return _.expect(once()).toBe(a + b + c);
        },
        [Number, Number, Number]
    ),
    'when testing once with calling multiple times should return correct value': _.check(
        function(a) {
            var once = _.once(
                function(a) {
                    return a++;
                },
                a
            );
            return _.expect(once()).toBe(once());
        },
        [_.Integer]
    )
};

exports.asyncOnce = {
    'when testing asyncOnce with resolving should return correct value': _.check(
        function(a) {
            var once = _.asyncOnce(
                    function(resolve) {
                        resolve(a);
                    }
                ),
                result;

            once(
                function(v) {
                    result = v;
                }
            );

            return _.expect(result).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing asyncOnce with resolving with one argument should return correct value': _.check(
        function(a) {
            var once = _.asyncOnce(
                    function(resolve, args) {
                        resolve(args[0]);
                    },
                    a
                ),
                result;

            once(
                function(a) {
                    result = a;
                }
            );

            return _.expect(result).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing asyncOnce with resolving with multiple arguments should return correct value': _.check(
        function(a, b, c) {
            var once = _.asyncOnce(
                    function(resolve, args) {
                        resolve(args);
                    },
                    a, b, c
                ),
                result;

            once(
                function(a) {
                    result = a;
                }
            );

            return _.expect(result).toBe([a, b, c]);
        },
        [_.AnyVal]
    )
};
