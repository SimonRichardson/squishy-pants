var _ = require('../bin/squishy-pants');

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

exports.empty = {
    testAnyVal: function(test) {
        var isAnyOf = _.isAnyTypeOf(['boolean', 'number', 'string']);
        test.ok(isAnyOf(_.empty(_.AnyVal)));
        test.done();
    },
    testArray: function(test) {
        test.ok(_.isInstanceOf(Array, _.empty(Array)));
        test.done();
    },
    testBoolean: function(test) {
        test.ok(_.isTypeOf('boolean', _.empty(Boolean)));
        test.done();
    },
    testFunction: function(test) {
        test.ok(_.isTypeOf('function', _.empty(Function)));
        test.done();
    },
    testNumber: function(test) {
        test.ok(_.isTypeOf('number', _.empty(Number)));
        test.done();
    },
    testObject: function(test) {
        test.ok(_.isTypeOf('object', _.empty(Object)));
        test.done();
    },
    testString: function(test) {
        test.ok(_.isTypeOf('string', _.empty(String)));
        test.done();
    }
};