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
    )
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
    ),
    'when using recursive multiple partial matching should return correct value': _.check(
        function(a) {
            var value = List.Cons(2, List.Cons(3, List.Cons(a, List.Nil))),
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
                        ).method(
                            function(a) {
                                return a === 2;
                            },
                            function(a, b) {
                                return b.match({
                                    Cons:
                                        _.partial().method(
                                            function(a) {
                                                return a === 3;
                                            },
                                            function(a, b) {
                                                return b.match({
                                                    Cons: _.identity,
                                                    Nil: _.constant(-1)
                                                });
                                            }
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
