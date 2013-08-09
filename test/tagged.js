var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });

exports.tagged = {
    testTagged: function(test) {
        var A = _.tagged('A', ['a', 'b']);
        var a = A(1, 2);
        test.equal(a.a, 1);
        test.equal(a.b, 2);
        test.expect(2);
        test.done();
    }
};

exports.match = {
    'when using recursive object matching should return correct value': _.check(
        function(a) {
            var value = _.Some(_.Right(_.Some(a))),
                result = value.match({
                    Some: {
                        Right: {
                            Some: _.identity,
                            None: _.constant(-1)
                        },
                        Left: _.constant(-1)
                    },
                    None: _.constant(-1)
                });

            return _.equal(result, a);
        },
        [_.AnyVal]
    ),
    'when using recursive partial matching should return correct value': _.check(
        function(a) {
            var value = List.Cons(1, List.Cons(a, List.Nil)),
                result = value.match({
                    Cons:
                        _.partial().method(
                            function(a) {
                                return a === 1;
                            },
                            function(a, b) {
                                return b.match({
                                    Cons:
                                        _.partial().method(
                                            _.constant(true),
                                            _.identity
                                        ),
                                    Nil: _.constant(-1)
                                });
                            }
                        ),
                    Nil: _.constant(-1)
                });

            return _.equal(result, a);
        },
        [_.AnyVal]
    )
};
