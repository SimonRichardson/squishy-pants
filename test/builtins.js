var _ = require('./lib/test'),
    split = _.curry(function(a, b) {
        return b.split(a);
    }),
    join = _.curry(function(a, b) {
        return b.join(a);
    }),
    push = _.curry(function(a, b) {
        var c = b.slice();
        c.push(a);
        return c;
    }),
    list = _.dimap(split(''), join(''));

exports.map = {
    'when testing map with function should return correct value': _.check(
        function(a, b) {
            return _.expect(
                _.map(
                    _.identity,
                    _.constant(b)
                )(a)
            ).toBe(b);
        },
        [Number, Number]
    ),
    'when testing map with number should return correct value': _.check(
        function(a, b) {
            return _.expect(
                _.map(
                    a,
                    _.constant(b)
                )
            ).toBe(b);
        },
        [Number, Number]
    ),
    'when testing map with string should return correct value': _.check(
        function(a, b) {
            return _.expect(
                _.map(
                    a,
                    _.constant(b)
                )
            ).toBe(b);
        },
        [String, String]
    )
};

exports.concat = {
    'when testing concat with function should return correct value': _.check(
        function(a, b) {
            return _.expect(
                _.concat(
                    _.constant(a),
                    _.constant(b)
                )
            ).toBe(a + b);
        },
        [Number, Number]
    ),
    'when testing concat with boolean should return correct value': _.check(
        function(a, b) {
            return _.expect(_.concat(a, b)).toBe(a & b);
        },
        [Boolean, Boolean]
    ),
    'when testing concat with number should return correct value': _.check(
        function(a, b) {
            return _.expect(_.concat(a, b)).toBe(a + b);
        },
        [Number, Number]
    ),
    'when testing concat with string should return correct value': _.check(
        function(a, b) {
            return _.expect(_.concat(a, b)).toBe(a + b);
        },
        [String, String]
    )
};

exports.ap = {
    'when testing ap with function should return correct value': _.check(
        function(a, b) {
            return _.expect(
                _.ap(
                    function(x) {
                        return function(y) {
                            return x + y;
                        };
                    },
                    _.constant(b)
                )(a)
            ).toBe(a + b);
        },
        [Number, Number]
    )
};

exports.negate = {
    'when testing negate with boolean should return correct value': _.check(
        function(a) {
            return _.expect(_.negate(a)).toBe(!a);
        },
        [Boolean]
    ),
    'when testing negate with number should return correct value': _.check(
        function(a) {
            return _.expect(_.negate(a)).toBe(-a);
        },
        [Number]
    )
};

exports.dimap = {
    'when testing dimap with truncate should return correct value': function(test) {
        truncate = list(_.compose(push('...'), _.flip(_.take)(5)));
        test.ok(_.expect(truncate('Hello World')).toBe('Hello...'));
        test.done();
    }
};

exports.kleisli = {
    'when testing kleisli should return correct value': _.check(
        function(a) {
            return _.expect(_.kleisli(function(x) {
                return _.Identity(x);
            }, _.identity)(a)).toBe(a);
        },
        [Number]
    )
};

exports.tupled = {
    'when testing tupled with tuple2 should return correct value': _.check(
        function(a) {
            function f(x, y) {
                return _.Tuple2(x, y);
            }
            return _.expect(_.tupled(f, a)).toBe(a);
        },
        [_.tuple2Of(_.AnyVal, _.AnyVal)]
    ),
    'when testing tupled with tuple3 should return correct value': _.check(
        function(a) {
            function f(x, y, z) {
                return _.Tuple3(x, y, z);
            }
            return _.expect(_.tupled(f, a)).toBe(a);
        },
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tupled with tuple4 should return correct value': _.check(
        function(a) {
            function f(x, y, z, b) {
                return _.Tuple4(x, y, z, b);
            }
            return _.expect(_.tupled(f, a)).toBe(a);
        },
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tupled with tuple5 should return correct value': _.check(
        function(a) {
            function f(x, y, z, b, c) {
                return _.Tuple5(x, y, z, b, c);
            }
            return _.expect(_.tupled(f, a)).toBe(a);
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tupled with tuple3 when expecting 2 should throw error': _.check(
        function(a) {
            function f(x, y) {
                return _.Tuple3(x, y);
            }
            var called = false;
            try {
                _.tupled(f, a);
            } catch(e) {
                called = true;
            }
            return called;
        },
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal)]
    )
};

exports.empty = {
    'when testing empty with AnyVal (boolean, number, string) should return any type': function(test) {
        var isAnyOf = _.isAnyTypeOf(['boolean', 'number', 'string']);
        test.ok(isAnyOf(_.empty(_.AnyVal)));
        test.done();
    },
    'when testing creating empty Array should return instanceof Array': function(test) {
        test.ok(_.isInstanceOf(Array, _.empty(Array)));
        test.done();
    },
    'when testing creating empty Boolean should return instanceof Boolean': function(test) {
        test.ok(_.isTypeOf('boolean', _.empty(Boolean)));
        test.done();
    },
    'when testing creating empty Function should return instanceof Function': function(test) {
        test.ok(_.isTypeOf('function', _.empty(Function)));
        test.done();
    },
    'when testing creating empty Number should return instanceof Number': function(test) {
        test.ok(_.isTypeOf('number', _.empty(Number)));
        test.done();
    },
    'when testing creating empty Object should return instanceof Object': function(test) {
        test.ok(_.isTypeOf('object', _.empty(Object)));
        test.done();
    },
    'when testing creating empty String should return instanceof String': function(test) {
        test.ok(_.isTypeOf('string', _.empty(String)));
        test.done();
    }
};

exports.equal = {
    'when testing equal with null should return true': function(test) {
        test.ok(_.equal(null, null));
        test.done();
    },
    'when testing equal with undefined should return true': function(test) {
        test.ok(_.equal(undefined, undefined));
        test.done();
    },
    'when testing equal with Boolean should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Boolean]
    ),
    'when testing equal with Function should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Function]
    ),
    'when testing equal with Number should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Number]
    ),
    'when testing equal with String should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [String]
    ),
    'when testing equal with Array should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing equal with Object should return true': _.check(
        function(a) {
            return _.equal(a, a);
        },
        [Object]
    ),
    'when testing equal with two different Object should return false': _.check(
        function(a, b) {
            return !_.equal(a, b);
        },
        [
            _.objectLike({
                x: Number
            }),
            _.objectLike({
                y: Number
            })
        ]
    ),
    'when testing equal with two similar Objects should return false': function(test) {
        var a = {x: 1},
            b = {x: 1, b: 2};

        test.ok(!_.equal(a, b));
        test.done();
    },
    'when testing equal with Boolean should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Boolean, String]
    ),
    'when testing equal with Function should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Function, String]
    ),
    'when testing equal with Number should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Number, String]
    ),
    'when testing equal with String should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [String, Array]
    ),
    'when testing equal with Array should not return true': _.check(
        function(a, b) {
            // If a and b is length of zero then it'll return true
            if (a.length === 0 && a.length === b.length) return true;

            return _.not(_.equal(a, b));
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(Object)]
    ),
    'when testing equal with Object should not return true': _.check(
        function(a, b) {
            return _.not(_.equal(a, b));
        },
        [Object, String]
    )
};

exports.expect = {
    'when testing expect with Boolean should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Boolean]
    ),
    'when testing expect with Function should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Function]
    ),
    'when testing expect with Number should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Number]
    ),
    'when testing expect with String should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [String]
    ),
    'when testing expect with Array should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing expect with Object should return true': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [Object]
    ),
    'when testing expect with Boolean should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Boolean, String]
    ),
    'when testing expect with Function should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Function, String]
    ),
    'when testing expect with Number should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Number, String]
    ),
    'when testing expect with String should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [String, Array]
    ),
    'when testing expect with Array should not return true': _.check(
        function(a, b) {
            // If a and b is length of zero then it'll return true
            if (a.length === 0 && a.length === b.length) return true;

            return _.not(_.expect(a).toBe(b));
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(Object)]
    ),
    'when testing expect with Object should not return true': _.check(
        function(a, b) {
            return _.not(_.expect(a).toBe(b));
        },
        [Object, String]
    )
};

exports.of = {
    'when testing of with AnyVal should return correct object': function(test) {
        test.ok(_.isAnyInstanceOf(
            [
                Boolean.constructor,
                Number.constructor,
                String.constructor
            ],
            _.of(_.AnyVal))
        );
        test.done();
    },
    'when testing of with Array should return correct object': function(test) {
        test.ok(_.isInstanceOf(Array.constructor, _.of(Array)));
        test.done();
    },
    'when testing of with Function should return correct object': function(test) {
        test.ok(_.isInstanceOf(Function.constructor, _.of(Function)));
        test.done();
    },
    'when testing of with Number should return correct object': function(test) {
        test.ok(_.isInstanceOf(Number.constructor, _.of(Number)));
        test.done();
    },
    'when testing of with Object should return correct object': function(test) {
        test.ok(_.isInstanceOf(Object.constructor, _.of(Object)));
        test.done();
    },
    'when testing of with String should return correct object': function(test) {
        test.ok(_.isInstanceOf(String.constructor, _.of(String)));
        test.done();
    }
};
