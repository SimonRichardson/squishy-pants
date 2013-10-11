var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    }),
    Maybe = _.taggedSum('Maybe', {
        Just: ['x'],
        Nothing: []
    });

exports.match = {
    'test': function(test) {
        var patterns = [
                ['Cons(a, Cons(b, Nil))', function(x, y) {
                    return x + y;
                }],
                ['_', function() {
                    return 0;
                }]
            ],
            value = List.Cons(1, List.Cons(2, List.Nil));

        test.equals(_.match(patterns)(value), 3);
        test.done();
    },
    'when checking a recursive match should return correct value': _.check(
        function(a, b) {
            var patterns = [
                    ['Cons(a, Cons(b, _))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called')]
                ],
                args = List.Cons(a, List.Cons(b, List.Nil));

            return _.expect(_.match(patterns)(args)).toBe(a + b);
        },
        [Number, Number]
    ),
    'when checking a recursive match multiple times should return correct value': _.check(
        function(a, b) {
            var patterns = [
                    ['Cons(a, Cons(b, _))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called')]
                ],
                args = List.Cons(a, List.Cons(b, List.Nil)),
                match = _.match(patterns);

            return _.expect(match(args)).toBe(match(args));
        },
        [Number, Number]
    ),
    'when checking a recursive exact match should return correct value': _.check(
        function(a, b) {
            var patterns = [
                    ['Cons(a, Cons(b, Nil))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called')]
                ],
                args = List.Cons(a, List.Cons(b, List.Nil));

            return _.expect(_.match(patterns)(args)).toBe(a + b);
        },
        [Number, Number]
    ),
    'when checking a recursive match with no value should return correct value': _.check(
        function(a) {
            var patterns = [
                    ['Cons(a, Cons(b, _))', _.error('Failed if called')],
                    ['_', function() {
                        return -1;
                    }]
                ],
                args = List.Cons(a, List.Nil);

            return _.expect(_.match(patterns)(args)).toBe(-1);
        },
        [Number]
    ),
    'when checking a recursive match with no default value should throw error': _.check(
        function(a) {
            var patterns = [
                    ['Cons(a, Cons(b, _))', _.error('Failed if called')]
                ],
                args = List.Cons(a, List.Nil),
                called = false;

            try {
                _.match(patterns)(args);
            } catch(error) {
                called = true;
            }

            return _.expect(called).toBe(true);
        },
        [Number]
    ),
    'when checking first match should return correct value': _.check(
        function(a, b) {
            var patterns = [
                    ['Cons(a, Cons(b, Nil))', function(x, y) {
                        return x + y;
                    }],
                    ['Cons(a, Cons(b, _))', _.error('Failed if called second')],
                    ['_', _.error('Failed if called default')]
                ],
                args = List.Cons(a, List.Cons(b, List.Nil));

            return _.expect(_.match(patterns)(args)).toBe(a + b);
        },
        [Number, Number]
    ),
    'when checking second match should return correct value': _.check(
        function(a, b, c) {
            var patterns = [
                    ['Cons(a, Cons(b, Nil))', _.error('Failed if called first')],
                    ['Cons(a, Cons(b, _))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called default')]
                ],
                args = List.Cons(a, List.Cons(b, List.Cons(c, List.Nil)));

            return _.expect(_.match(patterns)(args)).toBe(a + b);
        },
        [Number, Number, Number]
    ),
    'when checking nested monad just should return correct value': _.check(
        function(a, b, c) {
            var patterns = [
                    ['Cons(a, Cons(Just(b), _))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called default')]
                ],
                args = List.Cons(a, List.Cons(Maybe.Just(b), List.Cons(c, List.Nil)));

            return _.expect(_.match(patterns)(args)).toBe(a + b);
        },
        [Number, Number, Number]
    ),
    'when checking nested monad nothing should return correct value': _.check(
        function(a, b) {
            var patterns = [
                    ['Cons(a, Cons(Nothing, _))', function(x) {
                        return x;
                    }],
                    ['_', _.error('Failed if called default')]
                ],
                args = List.Cons(a, List.Cons(Maybe.Nothing, List.Cons(b, List.Nil)));

            return _.expect(_.match(patterns)(args)).toBe(a);
        },
        [Number, Number]
    )
};
