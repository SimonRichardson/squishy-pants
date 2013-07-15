var _ = require('../bin/squishy-pants');

exports.isTypeOf = {
    testIsTypeOf: function(test) {
        test.ok(_.isTypeOf('string', 'hello'));
        test.done();
    },
    testNegateIsTypeOf: function(test) {
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