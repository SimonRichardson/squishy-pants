var _ = require('./lib/test');

exports.writer = {
    'when testing writer with multiple maps should return correct value': function(test) {
        var half = _.Writer(function(a) {
                return _.Tuple2(a / 2, 'I just halved ' + a + '!');
            }),
            result = half.chain(_.constant(half)).run(8);

        test.ok(_.expect(result).toBe(_.Tuple2(2, 'I just halved 8!I just halved 4!')));
        test.done();
    },
    'when creating a writer using of then running should return correct value': _.check(
        function(a, b) {
            var writer = _.Writer.of(a);
            return _.expect(writer.run(b)).toBe(_.Tuple2(a, ''));
        },
        [_.Integer, _.Integer]
    ),
    'when creating a writer using ap then running should return correct value': _.check(
        function(a, b, c, d) {
            var writer = _.Writer(function(x) {
                    return _.Tuple2(_.concat(a + x), d);
                }),
                result = writer.ap(_.Writer.of(b)).run(c);

            return _.expect(result).toBe(_.Tuple2(a + c + b, d));
        },
        [_.Integer, _.Integer, _.Integer, String]
    ),
    'when creating a writer using ap and put then running should return correct value': _.check(
        function(a, b, c) {
            var writer = _.Writer.put(_.Tuple2(_.concat(a), c)),
                result = writer.ap(_.Writer.of(b)).run();

            return _.expect(result).toBe(_.Tuple2(a + b, c));
        },
        [_.Integer, _.Integer, String]
    ),
    'when creating a writer using chain then running should return correct value': _.check(
        function(a, b, c, d) {
            var writer = _.Writer(function(x) {
                    return _.Tuple2(a + x, c);
                }),
                result = writer.chain(function(t) {
                    return _.Writer.put(_.Tuple2(t + 1, d));
                }).run(b);

            return _.expect(result).toBe(_.Tuple2(a + b + 1, c + d));
        },
        [_.Integer, _.Integer, String, String]
    ),
    'when creating a writer using map then running should return correct value': _.check(
        function(a, b, c) {
            var writer = _.Writer(function(x) {
                    return _.Tuple2(a + x, c);
                }),
                result = writer.map(function(t) {
                    return t + 1;
                }).run(b);

            return _.expect(result).toBe(_.Tuple2(a + b + 1, c));
        },
        [_.Integer, _.Integer, String]
    ),
    'when creating a writer and using lens should be correct value': _.check(
        function(a, b, c) {
            var run = function(x) {
                    return _.Tuple2.of(b, x);
                },
                writer = _.Writer.lens().run(a).set(run);

            return _.expect(writer.run(c)).toBe(_.Tuple2.of(b, c));
        },
        [_.writerOf(_.AnyVal), _.AnyVal, _.AnyVal]
    ),
    'when creating a writer and using lens get should be correct value': _.check(
        function(a, b) {
            var writer = _.Writer.lens().run(a).get();
            return _.expect(writer.run()).toBe(a.extract());
        },
        [_.writerOf(_.AnyVal), _.AnyVal]
    ),
    'when using of should be correct value': _.check(
        function(a) {
            return _.expect(_.of(_.Writer, a).extract()).toBe(_.Tuple2(a, ''));
        },
        [_.AnyVal]
    ),
    'when using empty should be correct value': _.check(
        function(a) {
            return _.expect(_.empty(_.Writer).extract()._1).toBe(null);
        },
        [_.AnyVal]
    ),
    'when using ap should be correct value': _.check(
        function(a) {
            var writer = _.Writer.of(_.concat(1)),
                actual = _.ap(writer, _.Writer.of(a)),
                expected = writer.ap(_.Writer.of(a));
            return _.expect(actual.extract()).toBe(expected.extract());
        },
        [_.AnyVal]
    ),
    'when using chain should be correct value': _.check(
        function(a) {
            return _.expect(_.chain(_.Writer.of(a), function(x) {
                return _.Writer.of(x);
            }).extract()).toBe(_.Tuple2(a, ''));
        },
        [_.AnyVal]
    ),
    'when using extract should be correct value': _.check(
        function(a) {
            return _.expect(_.extract(_.Writer.of(a))).toBe(_.Tuple2(a, ''));
        },
        [_.AnyVal]
    ),
    'when using shrink should be correct value': _.check(
        function(a) {
            return _.expect(_.shrink(_.Writer.of(a))).toBe([]);
        },
        [_.AnyVal]
    )
};

exports.writerT = {
    'when testing writerT ap should return correct value': _.check(
        function(a, b, c, d) {
            var monad = _.Writer(function(x) {
                    return _.Tuple2(_.concat(a + x), d);
                }),
                transformer = _.Writer.WriterT(monad),
                actual = transformer(monad).ap(transformer(_.Writer.of(b))),
                expected = transformer(_.Writer.put(_.Tuple2(a + c + b, d)));

            return _.expect(actual.run.run(c)).toBe(expected.run.run());
        },
        [String, String, String, String]
    ),
    'when testing writerT with monad constructor ap should return correct value': _.check(
        function(a, b, c, d) {
            var monad = _.Writer(function(x) {
                    return _.Tuple2(_.concat(a + x), d);
                }),
                transformer = _.Writer.WriterT(_.Writer),
                actual = transformer(monad).ap(transformer(_.Writer.of(b))),
                expected = transformer(_.Writer.put(_.Tuple2(a + c + b, d)));

            return _.expect(actual.run.run(c)).toBe(expected.run.run());
        },
        [String, String, String, String]
    ),
    'when testing writerT map should return correct value': _.check(
        function(a, b, c) {
            var monad = _.Writer(function(x) {
                    return _.Tuple2(a + x, c);
                }),
                transformer = _.Writer.WriterT(monad),
                actual = transformer(monad).map(function(t) {
                    return t + 1;
                }),
                expected = transformer(_.Writer.put(_.Tuple2(a + b + 1, c)));

            return _.expect(actual.run.run(b)).toBe(expected.run.run());
        },
        [Number, Number, String]
    ),
    'when testing writerT chain should return correct value': _.check(
        function(a, b) {
            var transformer = _.Writer.WriterT(_.Writer.put(a)),
                actual = transformer(_.Writer.put(a)).chain(
                    function() {
                        return transformer(_.Writer.put(b));
                    }
                ),
                expected = transformer(_.Writer.put(_.Tuple2(b._1, _.concat(a._2, b._2))));

            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [_.tuple2Of(String, String), _.tuple2Of(String, String)]
    ),
    'when creating a writerT and using chain should be correct value': _.check(
        function(a, b) {
            var monad = _.Writer.put(a),
                transformer = _.Writer.WriterT(monad),
                actual = transformer(_.Writer.put(b)).chain(function(t) {
                    return _.Writer.WriterT(monad).of(t + 1);
                }),
                expected = transformer(_.Writer.put(_.Tuple2(b._1 + 1, b._2)));

            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [_.tuple2Of(Number, String), _.tuple2Of(Number, String)]
    ),
    'when creating a writerT and using chain with value should be correct value': _.check(
        function(a, b, c) {
            var monad = _.Writer(function(x) {
                    return _.Tuple2(a + x, c);
                }),
                transformer = _.Writer.WriterT(monad),
                actual = transformer(monad).chain(function(t) {
                    return _.Writer.WriterT(monad).of(t + 1);
                }),
                expected = transformer(_.Writer.put(_.Tuple2(a + b + 1, c)));

            return _.expect(actual.run.run(b)).toBe(expected.run.run());
        },
        [Number, Number, String]
    ),
    'when creating a writerT using writerTOf and chain should be correct value': _.check(
        function(a, b) {
            var actual = a(_.Writer.put(b)).chain(function(x) {
                    return _.Writer.WriterT(_.Writer.put(_.Tuple2(1, ''))).of(x + 1);
                }),
                expected = a(_.Writer.put(_.Tuple2(b._1 + 1, b._2)));

            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [_.writerTOf(String), _.tuple2Of(Number, String)]
    ),
    'when creating a writerT using writerTOf and map should be correct value': _.check(
        function(a, b) {
            var actual = _.map(
                    a(_.Writer.put(b)),
                    function(x) {
                        return x + 1;
                    }
                ),
                expected = a(_.Writer.put(_.Tuple2(b._1 + 1, b._2)));

            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [_.writerTOf(Number), _.tuple2Of(Number, String)]
    )
};
