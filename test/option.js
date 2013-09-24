var _ = require('./lib/test');

exports.option = {
    'when testing some with match should call some function': _.check(
        function(a) {
            return _.Some(a).match({
                Some: function(b) {
                    return _.expect(a).toBe(b);
                },
                None: _.badRight
            });
        },
        [_.AnyVal]
    ),
    'when testing none with match should call none function': _.check(
        function(a) {
            return _.None.match({
                Some: _.badLeft,
                None: _.constant(true)
            });
        },
        [String]
    ),

    'when creating some with value should set value on some': _.check(
        function(a) {
            return _.expect(_.Some(a).value).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating some should be valid option': _.check(
        function(a) {
            return _.isOption(_.Some(a));
        },
        [_.AnyVal]
    ),
    'when creating some should be some': _.check(
        function(a) {
            return _.Some(a).isSome;
        },
        [_.AnyVal]
    ),
    'when creating some should not be none': _.check(
        function(a) {
            return !_.Some(a).isNone;
        },
        [_.AnyVal]
    ),
    'when creating some and mapping value should map to correct value': _.check(
        function(a) {
            return _.expect(_.Some(a).map(_.inc)).toBe(_.Some(a + 1));
        },
        [Number]
    ),
    'when creating some and folding should map to correct value': _.check(
        function(a) {
            return _.expect(_.Some(a).fold(
                _.inc,
                _.error('Failed if called')
            )).toBe(a + 1);
        },
        [Number]
    ),
    'when creating none with value should set value on none': _.check(
        function(a) {
            return _.expect(_.None).toBe(_.None);
        },
        [_.AnyVal]
    ),
    'when creating none should be valid option': _.check(
        function(a) {
            return _.isOption(_.None);
        },
        [_.AnyVal]
    ),
    'when creating none should not be some': _.check(
        function(a) {
            return !_.None.isSome;
        },
        [_.AnyVal]
    ),
    'when creating none should be none': _.check(
        function(a) {
            return _.None.isNone;
        },
        [_.AnyVal]
    ),
    'when creating none and mapping value should map to correct value': _.check(
        function(a) {
            return _.expect(_.None.map(_.error('Failed if called'))).toBe(_.None);
        },
        [Number]
    ),
    'when creating none and folding should map to correct value': _.check(
        function(a) {
            return _.expect(_.None.fold(
                _.error('Failed if called'),
                _.constant(a)
            )).toBe(a);
        },
        [Number]
    ),
    'when testing some with getOrElse should return correct value': _.check(
        function(a, b) {
            return _.Some(a).getOrElse(b) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing none with getOrElse should return correct value': _.check(
        function(a) {
            return _.None.getOrElse(a) == a;
        },
        [_.AnyVal]
    ),
    'when testing some with toLeft should fold to correct value': _.check(
        function(a, b) {
            return _.Some(a).toLeft(b).fold(_.identity, _.badRight) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing none with toLeft should fold to correct value': _.check(
        function(a, b) {
            return _.None.toLeft(a).fold(_.badLeft, _.identity) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing some with toRight should fold to correct value': _.check(
        function(a, b) {
            return _.Some(a).toRight(b).fold(_.badLeft, _.identity) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing none with toRight should fold to correct value': _.check(
        function(a, b) {
           return _.None.toRight(a).fold(_.identity, _.badRight) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing some with ap should return correct value': _.check(
        function(a) {
            return _.expect(_.Some(_.identity).ap(_.Some(a))).toBe(_.Some(a));
        },
        [_.AnyVal]
    ),
    'when testing none with ap should return correct value': _.check(
        function(a) {
            return _.expect(_.None.ap(_.Some(a))).toBe(_.None);
        },
        [_.AnyVal]
    ),
    'when testing some with ap none should return correct value': _.check(
        function(a) {
            return _.expect(_.Some(a).ap(_.None)).toBe(_.None);
        },
        [_.AnyVal]
    ),
    'when testing some with chain should return correct value': _.check(
        function(a, b) {
            return _.expect(_.Some(a).chain(_.constant(_.Some(b)))).toBe(_.Some(b));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing none with chain should return correct value': _.check(
        function(a) {
            return _.expect(_.None.chain(_.constant(_.Some(a)))).toBe(_.None);
        },
        [_.AnyVal]
    ),
    'when testing some with chain none should return correct value': _.check(
        function(a) {
            return _.expect(_.Some(a).chain(_.constant(_.None))).toBe(_.None);
        },
        [_.AnyVal]
    ),
    'when testing some with get should return correct value': _.check(
        function(a) {
            return _.expect(_.Some(a).get()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing none with get should return correct value': function(test) {
        var called = false;
        try {
            _.None.get();
        } catch(e) {
            called = true;
        }
        test.ok(called);
        test.done();
    },
    'when testing some with extract should return correct value': _.check(
        function(a) {
            return _.expect(_.Some(a).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing none with extract should return correct value': function(test) {
        test.ok(_.None.extract() === null);
        test.done();
    },
    'when creating a some and using lens should be correct value': _.check(
        function(a, b) {
            return _.expect(_.Option.lens().run(a).set(b)).toBe(_.Some(b));
        },
        [_.someOf(_.AnyVal), _.AnyVal]
    ),
    'when creating a none and using lens should be correct value': _.check(
        function(a, b) {
            return _.expect(_.Option.lens().run(a).set(b)).toBe(_.None);
        },
        [_.noneOf(), _.AnyVal]
    )
};
