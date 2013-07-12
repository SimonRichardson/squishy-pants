var _ = require('../bin/squishy-pants'),
    always = function() {
        return true;
    },
    lessThan = function(a) {
        return function(v) {
            return v < a;
        };
    },
    greaterThan = function(a) {
        return function(v) {
            return v > a;
        };
    };

exports.environment = {
    testPropertyReturn: function(test) {
        var env = _.environment().property('a', 1);
        test.ok(env.a);
        test.done();
    },
    testProperty: function(test) {
        var env = _.environment().property('a', 1);
        test.equals(env.a, 1);
        test.done();
    },
    testPropertyWithSameName: function(test) {
        var env0 = _.environment().property('a', 1),
            env1 = env0.property('a', 2);
        test.equals(env1.a, 2);
        test.done();
    },
    testMethodReturn: function(test) {
        var env = _.environment().method('a', always, function() {
            return 1;
        });
        test.ok(env.a(true));
        test.done();
    },
    testMethod: function(test) {
        var env = _.environment().method('a', always, function() {
            return 1;
        });
        test.equals(env.a(true), 1);
        test.done();
    },
    testMethodWithSameName: function(test) {
        var env0 = _.environment().method('a', lessThan(5), function() {
                return 'low';
            }),
            env1 = env0.method('a', greaterThan(5), function() {
                return 'high';
            });
        test.equals(env1.a(4), 'low');
        test.equals(env1.a(6), 'high');
        test.done();
    },
    testMethodAndPropertyWithSameName: function(test) {
        var env0 = _.environment().method('a', always, function() {
                return 'low';
            }),
            msg = '';
        try {
            env1 = env0.property('a', 1);
        } catch (e) {
            msg = e.message;
        }

        test.equals(msg, 'Property `a` already in environment.');
        test.done();
    },
    testPropertyAndMethodWithSameName: function(test) {
        var env0 = _.environment().property('a', 1),
            msg = '';
        try {
            env1 = env0.method('a', always, function() {
                return 'low';
            });
        } catch (e) {
            msg = e.message;
        }

        test.equals(msg, 'Property `a` already in environment.');
        test.done();
    }
};