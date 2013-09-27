var _ = require('./lib/test');

exports.writer = {
    'when testing writer with multiple maps should return correct value': function(test) {
        var f = function(t) {
                return _.Tuple2(t._1 / 2, 'I just halved ' + t._1 + '!');
            },
            result = _.Writer.put(_.Tuple2(8, '')).map(f).map(f).run();

        test.ok(_.expect(result).toBe(_.Tuple2(2, 'I just halved 8!I just halved 4!')));
        test.done();
    },
    'when creating a writer using of then running should return correct value': _.check(
        function(a) {
            var writer = _.Writer.of(a);
            return _.expect(writer.run()).toBe(_.Tuple2(a, ''));
        },
        [_.Integer]
    ),
    'when creating a writer using ap then running should return correct value': _.check(
        function(a, b, c) {
            var writer = _.Writer.put(_.Tuple2(_.concat(a), c)),
                result = writer.ap(_.Writer.put(_.Tuple2(b, ''))).run();

            return _.expect(result).toBe(_.Tuple2(a + b, c));
        },
        [_.Integer, _.Integer, String]
    ),
    'when creating a writer using chain then running should return correct value': _.check(
        function(a, b, c) {
            var writer = _.Writer.put(_.Tuple2(a, b)),
                result = writer.chain(function(t) {
                    return _.Writer.put(_.Tuple2(t._1 + 1, c));
                }).run();

            return _.expect(result).toBe(_.Tuple2(a + 1, b + c));
        },
        [_.Integer, String, String]
    ),
    'when creating a writer using map then running should return correct value': _.check(
        function(a, b) {
            var writer = _.Writer.put(_.Tuple2(a, b)),
                result = writer.map(function(t) {
                    return _.Tuple2(t._1 + 1, '');
                }).run();

            return _.expect(result).toBe(_.Tuple2(a + 1, b));
        },
        [_.Integer, String]
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
    )
};

/*
exports.writerT = {
    'when testing writerT ap should return correct value': _.check(
        function(a, b, c) {
            var monad = _.Writer.put(_.Tuple2(b, '')),
                transformer = _.Writer.WriterT(monad),
                actual = transformer(_.Writer.put(_.Tuple2(_.concat(a), c))).ap(transformer(monad));//,
                //expected = transformer(_.Writer.put(_.Tuple2(a + b, c)));

            console.log('>>' + actual.run.run(_.Tuple2(a, b)));//, expected);

            throw new Error('E');
            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [String, String, String]
    ),
    'when testing writerT map should return correct value': _.check(
        function(a, b) {
            var monad = _.Writer.put(_.Tuple2(a, '')),
                transformer = _.Writer.WriterT(monad),
                actual = transformer(monad).map(function(t) {
                    return _.Tuple2(_.inc(t._1), t._2);
                }),
                expected = transformer(_.Writer.put(_.Tuple2(a + 1, '')));

            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [Number, Number]
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
                    return _.Writer.WriterT(monad).of(t._1 + 1);
                }),
                expected = transformer(_.Writer.put(_.Tuple2(b._1 + 1, b._2)));

            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [_.tuple2Of(Number, String), _.tuple2Of(Number, String)]
    ),
    'when creating a writerT using writerTOf and chain should be correct value': _.check(
        function(a, b) {
            var actual = a(_.Writer.put(b)).chain(function(x) {
                    return _.Writer.WriterT(_.Writer.put(_.Tuple2(1, ''))).of(x._1 + 1);
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
                        return _.Tuple2(x._1 + 1, '');
                    }
                ),
                expected = a(_.Writer.put(_.Tuple2(b._1 + 1, b._2)));

            return _.expect(actual.run.run()).toBe(expected.run.run());
        },
        [_.writerTOf(Number), _.tuple2Of(Number, String)]
    )
};
*/
