var _ = require('./lib/test');

exports.isTypeOf = {
    testIsTypeOf: function(test) {
        test.ok(_.isTypeOf('string', 'hello'));
        test.done();
    },
    testNotIsTypeOf: function(test) {
        test.notEqual(_.isTypeOf('function', 2));
        test.notEqual(_.isTypeOf('number', function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isBoolean = {
    testIsBoolean: function(test) {
        test.ok(_.isBoolean(true));
        test.ok(_.isBoolean(false));
        test.expect(2);
        test.done();
    },
    testNotIsBoolean: function(test) {
        test.notEqual(_.isBoolean('string'));
        test.notEqual(_.isBoolean(function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isFunction = {
    testIsFunction: function(test) {
        test.ok(_.isFunction(function() {}));
        test.done();
    },
    testNotIsFunction: function(test) {
        test.notEqual(_.isFunction('string'));
        test.notEqual(_.isFunction(2));
        test.expect(2);
        test.done();
    }
};

exports.isNumber = {
    testIsNumber: function(test) {
        test.ok(_.isNumber(2));
        test.ok(_.isNumber(2.2));
        test.ok(_.isNumber(-2.2));
        test.expect(3);
        test.done();
    },
    testNotIsNumber: function(test) {
        test.notEqual(_.isNumber('string'));
        test.notEqual(_.isNumber([]));
        test.expect(2);
        test.done();
    }
};

exports.isObject = {
    testIsObject: function(test) {
        test.ok(_.isObject({}));
        test.ok(_.isObject([]));
        test.expect(2);
        test.done();
    },
    testNotIsObject: function(test) {
        test.notEqual(_.isObject('string'));
        test.notEqual(_.isObject(function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isString = {
    testIsString: function(test) {
        test.ok(_.isString('string'));
        test.ok(_.isString(''));
        test.expect(2);
        test.done();
    },
    testNotIsString: function(test) {
        test.notEqual(_.isString(3));
        test.notEqual(_.isString(function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isArray = {
    testIsArray: function(test) {
        test.ok(_.isArray([]));
        test.ok(_.isArray([1, 2, 3]));
        test.expect(2);
        test.done();
    },
    testNotIsArray: function(test) {
        test.notEqual(_.isArray({0: 1, length: 1}));
        test.notEqual(_.isArray(function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isSameTypeOf = {
    'when testing isSameTypeOf with strings should be correct value': _.check(
        function(a, b) {
            return _.isSameTypeOf(a, b);
        },
        [String, String]
    ),
    'when testing isSameTypeOf with arrays should be correct value': _.check(
        function(a, b) {
            return _.isSameTypeOf(a, b);
        },
        [_.arrayOf(Number), _.arrayOf(String)]
    )
};

exports.isNaN = {
    'when testing isNaN should return correct value': _.check(
        function(a) {
            return !_.isNaN(a);
        },
        [Number]
    ),
    'when testing isNaN with string should return correct value': _.check(
        function(a) {
            return _.isNaN(a);
        },
        [String]
    )
};

exports.isNotNaN = {
    'when testing isNotNaN should return correct value': _.check(
        function(a) {
            return _.isNotNaN(a);
        },
        [Number]
    ),
    'when testing isNotNaN with string should return correct value': _.check(
        function(a) {
            return !_.isNotNaN(a);
        },
        [String]
    )
};

exports.isAnyOf = {
    'when testing isAnyOf with Number should be correct value': _.check(
        function(a, b) {
            return _.isAnyOf([b, a], a);
        },
        [Number, String]
    ),
    'when testing isAnyOf with Boolean should be correct value': _.check(
        function(a, b, c) {
            return !_.isAnyOf([b, c], a);
        },
        [Boolean, Number, String]
    )
};

exports.isAnyTypeOf = {
    'when testing isAnyTypeOf with Number should be correct value': _.check(
        function(a) {
            return _.isAnyTypeOf(['number', 'string'], a);
        },
        [Number]
    ),
    'when testing isAnyTypeOf with Boolean should be correct value': _.check(
        function(a) {
            return !_.isAnyTypeOf(['number', 'string'], a);
        },
        [Boolean]
    )
};

exports.isAnyInstanceOf = {
    'when testing isAnyInstanceOf with Number should be correct value': _.check(
        function(a) {
            return _.isAnyInstanceOf([Number, _.Identity], a);
        },
        [_.identityOf(Number)]
    ),
    'when testing isAnyInstanceOf with Boolean should be correct value': _.check(
        function(a) {
            return !_.isAnyInstanceOf([Number, String], a);
        },
        [Boolean]
    )
};

exports.isEven = {
    testIsEven: function(test) {
        test.ok(_.isEven(2));
        test.ok(_.isEven(4));
        test.expect(2);
        test.done();
    },
    testNotIsEven: function(test) {
        test.notEqual(_.isEven(1));
        test.notEqual(_.isEven(5));
        test.expect(2);
        test.done();
    }
};

exports.isOdd = {
    testIsOdd: function(test) {
        test.ok(_.isOdd(1));
        test.ok(_.isOdd(5));
        test.expect(2);
        test.done();
    },
    testNotIsOdd: function(test) {
        test.notEqual(_.isOdd(2));
        test.notEqual(_.isOdd(4));
        test.expect(2);
        test.done();
    }
};

exports.isPalindrome = {
    testIsPalindrome: function(test) {
        test.ok(_.isPalindrome('abba'));
        test.ok(_.isPalindrome('abcde!//$£@!$T%%T$!@£$//!edcba'));
        test.expect(2);
        test.done();
    },
    testNotIsPalindrome: function(test) {
        test.notEqual(_.isPalindrome('abbc'));
        test.notEqual(_.isPalindrome('%T$!@£$//!edcbaasdkjmlkjo'));
        test.expect(2);
        test.done();
    }
};

exports.isInstanceOf = {
    testIsInstanceOf: function(test) {
        var Point = function() {};
        test.ok(_.isInstanceOf(Point, new Point()));
        test.done();
    },
    testNotIsOdd: function(test) {
        var Point = function() {};
        test.notEqual(_.isInstanceOf(Point, {}));
        test.notEqual(_.isInstanceOf(Point, function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isArrayOf = {
    testIsArrayOf: function(test) {
        test.ok(_.isArrayOf(_.arrayOf(Number)));
        test.ok(_.isArrayOf(_.arrayOf(Array)));
        test.expect(2);
        test.done();
    },
    testNotIsArrayOf: function(test) {
        test.notEqual(_.isArrayOf({}));
        test.notEqual(_.isArrayOf(function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isObjectLike = {
    testIsObjectLike: function(test) {
        test.ok(_.isObjectLike(_.objectLike({
            age: Number,
            name: String
        })));
        test.done();
    },
    testNotIsObjectLike: function(test) {
        test.notEqual(_.isObjectLike([]));
        test.notEqual(_.isObjectLike(function() {}));
        test.expect(2);
        test.done();
    }
};

exports.isComparable = {
    'when testing isComparable should return true if has equal method': function(test) {
        test.ok(_.isComparable({
            equal: function() {}
        }));
        test.done();
    },
    'when testing isComparable should return false if has no equal method': function(test) {
        test.ok(!_.isComparable({
            equals: function() {}
        }));
        test.done();
    }
};

exports.isPlainObject = {
    'when testing isPlainObject should return false if number': _.check(
        function(a) {
            return !_.isPlainObject(a);
        },
        [Number]
    ),
    'when testing isPlainObject should return true if plain': _.check(
        function(a) {
            return _.isPlainObject(a);
        },
        [
            _.objectLike({
                a: String,
                b: Number,
                c: _.objectLike({
                    x: String,
                    y: Array,
                    z: _.objectLike({
                        i: Number,
                        j: Boolean
                    })
                })
            })
        ]
    ),
    'when testing isPlainObject should return false if not plain': _.check(
        function(a) {
            return !_.isPlainObject(a);
        },
        [
            _.identityOf(
                _.objectLike({
                    a: String,
                    b: Number,
                    c: _.objectLike({
                        x: String,
                        y: Array,
                        z: _.objectLike({
                            i: Number,
                            j: Boolean
                        })
                    })
                })
            )
        ]
    )
};

exports.isEmpty = {
    'when test isEmpty with true should return correct value': function(test) {
        test.ok(!_.isEmpty(true));
        test.done();
    },
    'when test isEmpty with false should return correct value': function(test) {
        test.ok(_.isEmpty(false));
        test.done();
    },
    'when test isEmpty with function() {} should return correct value': function(test) {
        test.ok(!_.isEmpty(function() {}));
        test.done();
    },
    'when test isEmpty with number should return correct value': function(test) {
        test.ok(!_.isEmpty(1));
        test.done();
    },
    'when test isEmpty with negative number should return correct value': function(test) {
        test.ok(_.isEmpty(-1));
        test.done();
    },
    'when test isEmpty with NaN number should return correct value': function(test) {
        test.ok(_.isEmpty(NaN));
        test.done();
    },
    'when test isEmpty with empty string should return correct value': function(test) {
        test.ok(_.isEmpty(''));
        test.done();
    },
    'when test isEmpty with whitespace string should return correct value': function(test) {
        test.ok(_.isEmpty('        '));
        test.done();
    },
    'when test isEmpty with a value string should return correct value': function(test) {
        test.ok(!_.isEmpty('a'));
        test.done();
    },
    'when test isEmpty with a empty array should return correct value': function(test) {
        test.ok(_.isEmpty([]));
        test.done();
    },
    'when test isEmpty with a non empty array should return correct value': function(test) {
        test.ok(!_.isEmpty([1]));
        test.done();
    },
    'when test isEmpty with a empty object should return correct value': function(test) {
        test.ok(_.isEmpty({}));
        test.done();
    },
    'when test isEmpty with a non empty object should return correct value': function(test) {
        test.ok(!_.isEmpty({a: 1}));
        test.done();
    }
};
