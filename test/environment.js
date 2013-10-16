var _ = require('./lib/test'),
    always = function() {
        return true;
    },
    never = function() {
        return false;
    },
    lessThan = _.curry(function(a, v) {
        return v < a;
    }),
    greaterThan = _.curry(function(a, v) {
        return v > a;
    }),
    isEqualTo = _.curry(function(a, b) {
        return _.equal(a, b);
    });

exports.environment = {
    'when testing property with a value should return correct value': _.check(
        function(a) {
            var env = _.environment().property('a', a);
            return _.expect(env.a).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing property with a value and overwriting should return correct value': _.check(
        function(a, b) {
            var env0 = _.environment().property('a', a),
                env1 = _.environment().property('a', b);

            return _.expect(env1.a).toBe(b);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing method with a value should return correct value': _.check(
        function(a) {
            var env = _.environment().method('a', always, _.constant(a));

            return _.expect(env.a()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing method with a value and overwriting should return the last correct value': _.check(
        function(a, b) {
            var env0 = _.environment().method('a', always, _.constant(a)),
                env1 = _.environment().method('a', always, _.constant(b));

            return _.expect(env1.a()).toBe(b);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing same method name, but different predicates should return low value': _.check(
        function(a) {
            var env0 = _.environment().method('a', isEqualTo('a'), _.error('Failed if called')),
                env1 = env0.method('a', isEqualTo(a), _.constant(true)),
                env2 = env1.method('a', isEqualTo('b'), _.error('Failed if called'));

            return _.expect(env2.a(a)).toBe(true);
        },
        [Number]
    ),
    'when testing same method name, but different predicate should return low value': function(test) {
        var env0 = _.environment().method('a', lessThan(5), _.constant('low')),
            env1 = env0.method('a', greaterThan(5), _.constant('high'));
        test.equals(env1.a(4), 'low');
        test.done();
    },
    'when testing same method name, but different predicate should return high value': function(test) {
        var env0 = _.environment().method('a', lessThan(5), _.constant('low')),
            env1 = env0.method('a', greaterThan(5), _.constant('high'));
        test.equals(env1.a(6), 'high');
        test.done();
    },
    'when testing adding a property with an already set method should throw correct value': _.check(
        function(a) {
            var env0 = _.environment().method(a, always, _.constant(true)),
                msg = '';

            try {
                env1 = env0.property(a, 1);
            } catch (e) {
                msg = e.message;
            }

            return _.expect(msg).toBe('Property `' + a + '` name is already in environment.');
        },
        [String]
    ),
    'when testing adding a method with an already set property should throw correct value': _.check(
        function(a) {
            var env0 = _.environment().property(a, 1),
                msg = '';

            try {
                env1 = env0.method(a, always, _.constant(true));
            } catch (e) {
                msg = e.message;
            }

            return _.expect(msg).toBe('Method `' + a + '` name is already in environment.');
        },
        [String]
    ),
    'when testing retrieving a unknown item should throw correct value': _.check(
        function(a, b) {
            var env0 = _.environment().method(a, never, _.constant(true)),
                msg = '';

            try {
                env1 = env0[a](b);
            } catch (e) {
                msg = e.message;
            }

            return _.expect(msg).toBe('Method `' + a + '` not implemented for this input');
        },
        [String, _.AnyVal]
    ),
    'when testing isDefinedAt with a method should return correct value': function(test) {
        var env0 = _.environment().method('a', always, function() {
            return true;
        });

        test.ok(env0.isDefinedAt('a', true));
        test.done();
    },
    'when testing isDefinedAt with a method that doesn\'t exist should return correct value': function(test) {
        var env0 = _.environment().method('a', always, function() {
            return true;
        });

        test.ok(!env0.isDefinedAt('b', true));
        test.done();
    },
    'when testing isDefinedAt with a property should return correct value': function(test) {
        var env0 = _.environment().property('a', 1);

        test.ok(!env0.isDefinedAt('a', true));
        test.done();
    }
};