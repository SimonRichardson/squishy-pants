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
    'when testing a basic set up should return correct value': function(test) {
        var patterns = [
                ['Cons(a, List.Cons("2", List.Nil))', function(a, b, c) {
                    return a + b;
                }],
                ['_', function() {
                    return 0;
                }]
            ],
            value = List.Cons(1, List.Cons("2", List.Nil));

        test.equals(_.match(patterns)(value), "12");
        test.done();
    },
    'when checking a recursive match with numbers should return correct value': _.check(
        function(a, b) {
            var patterns = [
                    ['Cons(a, Cons(' + b + ', _))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called')]
                ],
                args = List.Cons(a, List.Cons(b, List.Nil));

            return _.expect(_.match(patterns)(args)).toBe(a + b);
        },
        [Number, Number]
    ),
    'when checking a recursive match with strings should return correct value': _.check(
        function(a, b) {
            var clean = b.replace('"', ''),
                patterns = [
                    ['Cons(a, Cons("' + clean + '", _))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called')]
                ],
                args = List.Cons(a, List.Cons(clean, List.Nil));

            return _.expect(_.match(patterns)(args)).toBe(a + clean);
        },
        [Number, String]
    ),
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
    ),
    'when checking nested monad just with just should return correct value': _.check(
        function(a, b, c) {
            var patterns = [
                    ['Cons(a, Cons(Just(Just(b)), _))', function(x, y) {
                        return x + y;
                    }],
                    ['_', _.error('Failed if called default')]
                ],
                args = List.Cons(a, List.Cons(Maybe.Just(Maybe.Just(b)), List.Cons(c, List.Nil)));

            return _.expect(_.match(patterns)(args)).toBe(a + b);
        },
        [Number, Number, Number]
    ),
    'when checking full recursive match should return correct value': _.check(
        function(a, b, c) {
            var patterns = [
                    ['Cons(a, Cons(Just(Just(b)), Cons(c, Cons(_, Nil)))))', _.error('Failed if called first')],
                    ['Cons(a, Cons(Just(Just(b)), Cons(c, Nil)))', function(x, y, z) {
                        return x + y + z;
                    }],
                    ['_', _.error('Failed if called default')]
                ],
                args = List.Cons(a, List.Cons(Maybe.Just(Maybe.Just(b)), List.Cons(c, List.Nil)));

            return _.expect(_.match(patterns)(args)).toBe(a + b + c);
        },
        [Number, Number, Number]
    ),
    'when checking full name match should return correct value': _.check(
        function(a, b, c) {
            var patterns = [
                    ['List.Cons(a, Cons(Maybe.Just(Just(b)), List.Cons(c, List.Cons(_, Nil)))))', _.error('Failed if called first')],
                    ['List.Cons(a, Cons(Just(Maybe.Just(b)), List.Cons(c, List.Nil)))', function(x, y, z) {
                        return x + y + z;
                    }],
                    ['_', _.error('Failed if called default')]
                ],
                args = List.Cons(a, List.Cons(Maybe.Just(Maybe.Just(b)), List.Cons(c, List.Nil)));

            return _.expect(_.match(patterns)(args)).toBe(a + b + c);
        },
        [Number, Number, Number]
    ),
    'when checking full name match should return default value': _.check(
        function(a) {
            var patterns = [
                    ['List.Cons(a, Cons(Maybe.Just(Just(b)), List.Cons(c, List.Cons(_, Nil)))))', _.error('Failed if called first')],
                    ['List.Cons(a, Cons(Just(Maybe.Just(b)), List.Cons(c, List.Nil)))', _.error('Failed if called second')],
                    ['_', function() {
                        return -1;
                    }]
                ],
                args = List.Cons(a, List.Nil);

            return _.expect(_.match(patterns)(args)).toBe(-1);
        },
        [Number]
    ),
    'when checking a invalid namespace branch': _.check(
        function(a, b) {
            var patterns = [
                    ['Some(a)', function(x, y) {
                        return x + y;
                    }]
                ],
                args = List.Cons(a, List.Cons(b, List.Nil));

            var called = false;
            try {
                _.match(patterns)(args);
            } catch(e) {
                called = true;
            }

            return called;
        },
        [Number, Number]
    ),
    'when checking a invalid equal wildcard branch': _.check(
        function(a, b) {
            var patterns = [
                    ['Cons(1, "abc")', function() {
                        return 1;
                    }],
                    ['_', _.error('Failed if called')]
                ],
                args = List.Cons(1, "abc");

            return _.expect(_.match(patterns)(args)).toBe(1);
        },
        [Number, Number]
    ),
    'when testing destructuring with strings should return correct value': function(test) {
        var patterns = [
                ['Cons(_, Cons({a : "x", b : "y"}, Nil))', function() {
                    return 1;
                }],
                ['_', function() {
                    return -1;
                }]
            ],
            value = List.Cons(1, List.Cons({a: 'x', b:'y'}, List.Nil));

        test.equals(_.match(patterns)(value), 1);
        test.done();
    },
    'when testing destructuring array with numbers should return correct value': function(test) {
        var patterns = [
                ['Cons(_, Cons({a : [1, 2], b : "x"}, Nil))', function() {
                    return 1;
                }],
                ['_', function() {
                    return -1;
                }]
            ],
            value = List.Cons(1, List.Cons({a:[1, 2], b:'x'}, List.Nil));

        test.equals(_.match(patterns)(value), 1);
        test.done();
    },
    'when testing destructuring array with strings should return correct value': function(test) {
        var patterns = [
                ['Cons(_, Cons({a : ["x", "y", "z"], b : "x"}, Nil))', function() {
                    return 1;
                }],
                ['_', function() {
                    return -1;
                }]
            ],
            value = List.Cons(1, List.Cons({a:['x', 'y', 'z'], b:'x'}, List.Nil));

        test.equals(_.match(patterns)(value), 1);
        test.done();
    },
    'when testing destructuring with strings idents should return correct value': function(test) {
        var patterns = [
                ['Cons(_, Cons({"a" : ["x", "y", "z"], "b" : "x"}, Nil))', function() {
                    return 1;
                }],
                ['_', function() {
                    return -1;
                }]
            ],
            value = List.Cons(1, List.Cons({a:['x', 'y', 'z'], b:'x'}, List.Nil));

        test.equals(_.match(patterns)(value), 1);
        test.done();
    },
    'when checking destructuring of arrays in objects should be correct value': _.check(
        function(a, b) {
            var patterns = [
                ['Cons(_, Cons({a : [' + a.toString() + '], b : "x"}, Nil))', function() {
                    return 1;
                }],
                ['_', _.error('Failed if called')]
            ],
            value = List.Cons(1, List.Cons({a:a, b:'x'}, List.Nil));

            return _.expect(_.match(patterns)(value)).toBe(1);
        },
        [_.arrayOf(Number), Number]
    ),
    'when checking destructuring objects should be correct value': _.check(
        function(a) {
            var patterns = [
                ['Cons(_, Cons(' + JSON.stringify(a) + ', Nil))', function() {
                    return 1;
                }],
                ['_', _.error('Failed if called')]
            ],
            value = List.Cons(1, List.Cons(a, List.Nil));

            return _.expect(_.match(patterns)(value)).toBe(1);
        },
        [Object]
    )
};
