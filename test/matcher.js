var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });

exports.matcher = {
    'test': function(test) {
        var options = {
                'Cons(a, Cons(b, _))': function(x, y) {
                    return x + y;
                },
                '_': function() {
                    return 0;
                }
            },
            value = List.Cons(1, List.Cons(2, List.Nil));

        test.equals(_.matcher(options, value), 3);
        test.done();
    },
    'when checking a recursive match should return correct value': _.check(
        function(a, b) {
            var options = {
                    'Cons(a, Cons(b, _))': function(x, y) {
                        return x + y;
                    },
                    '_': function() {
                        return 0;
                    }
                },
                args = List.Cons(a, List.Cons(b, List.Nil));

            return _.expect(_.matcher(options, args)).toBe(a + b);
        },
        [Number, Number]
    ),
    'when checking a recursive match with no value should return correct value': _.check(
        function(a) {
            var options = {
                    'Cons(a, Cons(b, _))': _.error('Failed if called'),
                    '_': function() {
                        return -1;
                    }
                },
                args = List.Cons(a, List.Nil);

            return _.expect(_.matcher(options, args)).toBe(-1);
        },
        [Number]
    )
};
