var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });

exports.tagged = {
    'when creating a tagged type, should return correct first value': _.check(
        function(a, b) {
            return _.equal(_.tagged('T', ['a', 'b'])(a, b).a, a);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a tagged type, should return correct second value': _.check(
        function(a, b) {
            return _.equal(_.tagged('T', ['a', 'b'])(a, b).a, a);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a tagged type, should return correct toString value': _.check(
        function(a, b, c) {
            return _.equal(_.tagged(a, ['b', 'c'])(b, c).toString(), a + '(' + b + ', ' + c + ')');
        },
        [String, Number, Number]
    )
};

exports.taggedSum = {
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
    )
};
