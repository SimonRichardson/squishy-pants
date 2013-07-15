var _ = require('../bin/squishy-pants');

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
    testExtend: function(test) {
        test.deepEqual(_.extend({a: 1}, {b: 2}), {a: 1, b: 2});
        test.done();
    },
    testExtendOverwrite: function(test) {
        test.deepEqual(_.extend({a: 1}, {a: 2}), {a: 2});
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

