var _ = require('./lib/test'),
    A = function() {},
    B = function() {},
    C = function() {};

A.prototype =  {
    doA: function() {
        return 'A';
    }
};

B.prototype =  {
    doB: function() {
        return 'B';
    }
};

C.prototype =  {
    doC: function() {
        return 'C';
    }
};

exports.functionName = {
    testNamed: function(test) {
        test.equals(_.functionName(function a(){}), 'a');
        test.done();
    },
    testUnnamed: function(test) {
        test.equals(_.functionName(function (){}), '');
        test.done();
    },
    testVarNamed: function(test) {
        var b = function a(){};
        test.equals(_.functionName(b), 'a');
        test.done();
    },
    testForcedNamed: function(test) {
        var b = function c(){};
        b._name = 'a';
        test.equals(_.functionName(b), 'a');
        test.done();
    }
};

exports.functionLength = {
    testNoArgs: function(test) {
        test.equals(_.functionLength(function (){}), 0);
        test.done();
    },
    testOneArg: function(test) {
        test.equals(_.functionLength(function (a){}), 1);
        test.done();
    },
    testMultiArg: function(test) {
        test.equals(_.functionLength(function (a, b, c, d){}), 4);
        test.done();
    },
    testMultiArgWithForcedLength: function(test) {
        var b = function c(x, y, z){};
        b._length = 5;
        test.equals(_.functionLength(b), 5);
        test.done();
    },
    testForcedLength: function(test) {
        var b = function c(){};
        b._length = 5;
        test.equals(_.functionLength(b), 5);
        test.done();
    }
};

exports.create = {
    testCreation: function(test) {
        var Point = function(){};
        test.ok(_.create(Point.prototype) instanceof Point);
        test.done();
    }
};

exports.getInstance = {
    testGetInstanceWithFunction: function(test) {
        var Point = function(){
            var a = _.getInstance(this, Point);
            return a;
        };
        var point = Point();
        test.ok(_.getInstance(point, Point) instanceof Point);
        test.done();
    },
    testGetInstanceWithInstance: function(test) {
        var Point = function(){
            var a = _.getInstance(this, Point);
            return a;
        };
        var point = new Point();
        test.ok(_.getInstance(point, Point) instanceof Point);
        test.done();
    },
    testGetInstanceWithFunctionArguments: function(test) {
        var Point = function(x){
            var a = _.getInstance(this, Point);
            a.x = x;
            return a;
        };
        var random = Math.random();
        var point = Point(random);
        test.ok(_.getInstance(point, Point).x, random);
        test.done();
    },
    testGetInstanceWithInstanceArguments: function(test) {
        var Point = function(x){
            var a = _.getInstance(this, Point);
            a.x = x;
            return a;
        };
        var random = Math.random();
        var point = new Point(random);
        test.ok(_.getInstance(point, Point).x, random);
        test.done();
    }
};

exports.singleton = {
    testString: function(test) {
        test.deepEqual(_.singleton('a', '1'), {'a': 1});
        test.done();
    },
    testObjectKey: function(test) {
        test.deepEqual(_.singleton({a: 1}, '1'), {'[object Object]': 1});
        test.done();
    }
};

exports.extend = {
    'when testing extend with object should create a new object': function(test) {
        test.deepEqual(_.extend({a: 1}, {b: 2}), {a: 1, b: 2});
        test.done();
    },
    'when testing extend with object should create a new object without modifying new object': function(test) {
        var a = {a: 1},
            b = {b: 2},
            c = _.extend(a, b);

        test.deepEqual(a, {a: 1});
        test.deepEqual(b, {b: 2});
        test.done();
    },
    'when extending a a object should override property correctly from the right biased': function(test) {
        test.deepEqual(_.extend({a: 1}, {a: 2}), {a: 2});
        test.done();
    },
    'when creating mixin should create a new object with all correct methods': function(test) {
        var X = function() {},
            x;

        X.prototype = _.extend(_.extend(A.prototype, B.prototype), C.prototype);

        x = new X();

        test.equal(x.doA() + x.doB() + x.doC(), 'ABC');
        test.done();
    },
    'when creating mixin should not modify original objects': function(test) {
        var X = function() {},
            x;

        X.prototype = _.extend(_.extend(A.prototype, B.prototype), C.prototype);

        x = new X();

        test.deepEqual(A.prototype, {doA: A.prototype.doA});
        test.deepEqual(B.prototype, {doB: B.prototype.doB});
        test.deepEqual(C.prototype, {doC: C.prototype.doC});
        test.done();
    }
};

exports.bind = {
    testBind: function(test) {
        var a = _.bind(function(a, b, c) {
            test.equal(a + b + c, 6);
        });

        a()(1, 2, 3);

        test.expect(1);
        test.done();
    },
    testCurryFunctionName: function(test) {
        var a = _.bind(function namedFunction(a, b, c) {})();

        test.equal(_.functionName(a), 'namedFunction');
        test.done();
    },
    testCurryFunctionLength: function(test) {
        var a = _.bind(function(a, b, c) {})();

        test.equal(_.functionLength(a), 3);
        test.done();
    }
};

exports.compose = {
    testCompose: function(test) {
        function f(x) {
            return x + 1;
        }
        function g(x) {
            return x + 2;
        }

        test.equal(_.compose(f, g)(1), f(g(1)));
        test.done();
    }
};

exports.identity = {
    testIdentity: function(test) {
        test.equal(_.identity(1), 1);
        test.done();
    }
};

exports.constant = {
    testConstant: function(test) {
        test.equal(_.constant(1)(), 1);
        test.done();
    }
};

exports.access = {
    testAccess: function(test) {
        test.equal(_.access('a')(_.singleton('a', 1)), 1);
        test.done();
    }
};

exports.andThen = {
    testAndThen: function(test) {
        function f(x) {
            return x + 1;
        }
        function g(x) {
            return x + 2;
        }

        test.equal(_.andThen(g, f)(1), f(g(1)));
        test.done();
    }
};

exports.sequence = {
    testSequence: function(test) {
        test.equal(_.sequence(_.Identity(1), _.Identity(2)).x, 2);
        test.done();
    }
};

exports.then = {
    'when call then and checking that arguments passed are correct': _.check(
        function(a, b) {
            return _.expect(_.then(_.add, [a, b]), _.add(a, b));
        },
        [_.Integer, _.Integer]
    )
};

exports.liftA2 = {
    testliftA2: function(test) {
        function f(x) {
            return x;
        }
        test.equal(_.liftA2(_.add, f, f)(1), 2);
        test.done();
    }
};

exports.arrayOf = {
    testArrayOf: function(test) {
        test.equal(_.arrayOf(Number).type, Number);
        test.done();
    }
};

exports.objectLike = {
    testObjectLike: function(test) {
        test.equal(_.objectLike({age: Number}).props.age, Number);
        test.done();
    }
};

exports.or = {
    testOr: function(test) {
        test.equal(_.or(0, 1), 1);
        test.done();
    }
};

exports.and = {
    testAnd: function(test) {
        test.equal(_.and(0, 1), false);
        test.done();
    }
};

exports.add = {
    testAdd: function(test) {
        test.equal(_.add(2, 1), 3);
        test.done();
    }
};

exports.times = {
    testTimes: function(test) {
        test.equal(_.times(2, 3), 6);
        test.done();
    }
};

exports.strictEquals = {
    testStrictEquals: function(test) {
        var a = {};
        test.equal(_.strictEquals(a, a), true);
        test.equal(_.strictEquals(a, {}), false);
        test.done();
    }
};

exports.not = {
    testNot: function(test) {
        test.equal(_.not(true), false);
        test.done();
    }
};

exports.curry = {
    testCurry: function(test) {
        var a = _.curry(function(a, b, c){
            test.equal(a + b + c, 6);
        });

        // Possible ways to complete a curry
        a(1, 2, 3);
        a(1, 2)(3);
        a(1)(2)(3);
        a(1)(2, 3);

        test.expect(4);
        test.done();
    },
    testCurryFunctionName: function(test) {
        var a = _.curry(function namedFunction(a, b, c) {});

        test.equal(_.functionName(a), 'namedFunction');
        test.equal(_.functionName(a(1)), 'namedFunction');
        test.equal(_.functionName(a(1)(2)), 'namedFunction');

        test.expect(3);
        test.done();
    },
    testCurryFunctionLength: function(test) {
        var a = _.curry(function(a, b, c) {});

        test.equal(_.functionLength(a), 3);
        test.equal(_.functionLength(a(1)), 2);
        test.equal(_.functionLength(a(1)(2)), 1);

        test.expect(3);
        test.done();
    }
};

exports.flip = {
    'when testing flip should return the first two flipped arguments': _.check(
        function(a, b) {
            var called,
                r = _.flip(
                function(x, y) {
                    called = [x, y];
                }
            )(a)(b);

            return _.expect(called).toBe([b, a]);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing flip should return the first two flipped arguments and pass the rest': _.check(
        function(a, b, c, d) {
            var called,
                r = _.flip(
                function(x, y) {
                    called = [x, y].concat(_.rest(arguments).slice(2));
                }
            )(a)(b, c, d);

            return _.expect(called).toBe([b, a, c, d]);
        },
        [_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal]
    )
};

exports.oneOf = {
    testOneOf: function(test) {
        var a = ['boolean', 'number', 'string'];
        test.ok(_.isAnyOf(a)(_.oneOf(a)));
        test.done();
    }
};

exports.randomRange = {
    testRandomRange: function(test) {
        var a = _.randomRange(10, 100);
        test.ok(a >= 10 && a <= 100);
        test.done();
    }
};

