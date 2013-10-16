var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });

exports.tagged = {
    'when creating a tagged type, should return correct first value': _.check(
        function(a, b) {
            return _.expect(_.tagged('T', ['a', 'b'])(a, b).a).toBe(a);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a tagged type, should return correct second value': _.check(
        function(a, b) {
            return _.expect(_.tagged('T', ['a', 'b'])(a, b).a).toBe(a);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a tagged type, should return correct toString value': _.check(
        function(a, b, c) {
            var actual = _.tagged(a, ['b', 'c'])(b, c).toString();

            return _.expect(actual).toBe(a + '(' + b + ', ' + c + ')');
        },
        [String, Number, Number]
    ),
    'when creating a tagged type, should return correct toArray value': _.check(
        function(a, b, c) {
            var actual = _.tagged(a, ['b', 'c'])(b, c).toArray();

            return _.expect(actual).toBe([b, c]);
        },
        [String, Number, Number]
    ),
    'when creating a tagged type with to many arguments throws correct error': _.check(
        function(a, b) {
            var t = _.tagged('T', ['a']),
                msg = '';

            try {
                t(a, b);
            } catch(e) {
                msg = e.message;
            }
            return _.expect(msg).toBe('Expected 1 arguments, got 2 for T');
        },
        [Number, Number]
    ),
    'when creating a tagged type with to few arguments throws correct error': _.check(
        function(a, b) {
            var t = _.tagged('T', ['a', 'b', 'c']),
                msg = '';

            try {
                t(a, b);
            } catch(e) {
                msg = e.message;
            }
            return _.expect(msg).toBe('Expected 3 arguments, got 2 for T');
        },
        [Number, Number]
    ),
    'when creating a tagged value should return correct toString': _.check(
        function(a) {
            var t = _.tagged(a, []);
            return _.expect(t().toString()).toBe(a);
        },
        [String]
    ),
    'when creating a tagged value not using an array should throw correct error': function(test) {
        var msg = '';
        try {
            _.tagged('T', 1);
        } catch(e) {
            msg = e.message;
        }
        test.ok(msg === 'Expected Array but got `number`');
        test.done();
    }
};

exports.taggedSum = {
    'when creating a taggedSum and calling definition should throw correct value': function(test) {
        var msg = '';
        try {
            List();
        } catch(e) {
            msg = e.message;
        }
        test.ok(msg === 'Tagged sum was called instead of one of its properties.');
        test.done();
    },
    'when checking head value should return correct value': _.check(
        function(a) {
            var list = List.Cons(a, List.Nil);

            return _.expect(list.head).toBe(a);
        },
        [Number]
    ),
    'when checking tail value should return correct value': _.check(
        function(a) {
            var list = List.Cons(a, List.Nil);

            return _.expect(list.tail).toBe(List.Nil);
        },
        [Number]
    ),
    'when checking match without all properties throws correct error': _.check(
        function(a) {
            var list = List.Cons(a, List.Nil),
                msg = '';

            try {
                list.match({
                    Nil: _.error('Failed if called')
                });
            } catch(e) {
                msg = e.message;
            }

            return _.expect(msg).toBe('Constructors given to match didn\'t include: Cons');
        },
        [Number]
    ),
    'when checking match with first tagged value should return correct value': _.check(
        function(a) {
            var list = List.Cons(a, List.Nil),
                actual = list.match({
                    Cons: _.identity,
                    Nil: _.error('Failed if called')
                });

            return _.expect(actual).toBe(a);
        },
        [Number]
    ),
    'when checking match with second tagged value should return correct value': _.check(
        function(a) {
            var list = List.Nil,
                actual = list.match({
                    Cons: _.error('Failed if called'),
                    Nil: _.constant('nil')
                });

            return _.expect(actual).toBe('nil');
        },
        [Number]
    ),
    'when checking toString should return correct value': _.check(
        function(a, b) {
            var actual = List.Cons(a, List.Cons(b, List.Nil));

            return _.expect(actual.toString()).toBe('Cons(' + a + ', Cons(' + b + ', Nil))');
        },
        [Number, Number]
    ),
    'when checking toArray for List.Nil should return correct value': _.check(
        function(a, b) {
            var actual = List.Nil.toArray();
            return _.expect(actual).toBe([]);
        },
        [Number, Number]
    ),
    'when checking toArray for List.Cons should return correct value': _.check(
        function(a, b) {
            var actual = List.Cons(a, List.Cons(b, List.Nil)).toArray();
            return _.expect(actual).toBe([a, b]);
        },
        [Number, Number]
    ),
    'when checking flat toArray for List.Cons should return correct value': _.check(
        function(a, b) {
            var actual = List.Cons(a, b).toArray();
            return _.expect(actual).toBe([a, b]);
        },
        [Number, Number]
    )
};
