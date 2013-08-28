var _ = require('./lib/test');

exports.lazy = {
    'when testing lazy with one argument should return correct value': _.check(
        function(a) {
            var lazy = _.lazy(
                function(a) {
                    return a;
                },
                a
            );
            return _.expect(lazy()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing lazy with multiple arguments should return correct value': _.check(
        function(a, b, c) {
            var lazy = _.lazy(
                function(a, b, c) {
                    return a + b + c;
                },
                a, b, c
            );
            return _.expect(lazy()).toBe(a + b + c);
        },
        [Number, Number, Number]
    ),
    'when testing lazy with calling multiple times should return correct value': _.check(
        function(a) {
            var lazy = _.lazy(
                function(a) {
                    return a++;
                },
                a
            );
            return _.expect(lazy()).toBe(lazy());
        },
        [_.Integer]
    )
};

exports.lazyAsync = {
    'when testing lazyAsync with resolving should return correct value': _.check(
        function(a) {
            var lazy = _.lazyAsync(
                    function(resolve, reject) {
                        resolve(a);
                    }
                ),
                result;

            lazy(
                function(a) {
                    result = a;
                },
                _.badRight
            );

            return _.expect(result).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing lazyAsync with rejecting should return correct value': _.check(
        function(a) {
            var lazy = _.lazyAsync(
                    function(resolve, reject) {
                        reject(a);
                    }
                ),
                result;

            lazy(
                _.badLeft,
                function(a) {
                    result = a;
                }
            );

            return _.expect(result).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing lazyAsync with resolving with one argument should return correct value': _.check(
        function(a) {
            var lazy = _.lazyAsync(
                    function(resolve, reject, args) {
                        resolve(args[0]);
                    },
                    a
                ),
                result;

            lazy(
                function(a) {
                    result = a;
                },
                _.badRight
            );

            return _.expect(result).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing lazyAsync with resolving with multiple arguments should return correct value': _.check(
        function(a, b, c) {
            var lazy = _.lazyAsync(
                    function(resolve, reject, args) {
                        resolve(args);
                    },
                    a, b, c
                ),
                result;

            lazy(
                function(a) {
                    result = a;
                },
                _.badRight
            );

            return _.expect(result).toBe([a, b, c]);
        },
        [_.AnyVal]
    ),
    'when testing lazyAsync with rejecting with one argument should return correct value': _.check(
        function(a) {
            var lazy = _.lazyAsync(
                    function(resolve, reject, args) {
                        reject(args[0]);
                    },
                    a
                ),
                result;

            lazy(
                _.badLeft,
                function(a) {
                    result = a;
                }
            );

            return _.expect(result).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing lazyAsync with rejecting with multiple arguments should return correct value': _.check(
        function(a, b, c) {
            var lazy = _.lazyAsync(
                    function(resolve, reject, args) {
                        reject(args);
                    },
                    a, b, c
                ),
                result;

            lazy(
                _.badLeft,
                function(a) {
                    result = a;
                }
            );

            return _.expect(result).toBe([a, b, c]);
        },
        [_.AnyVal]
    )
};
