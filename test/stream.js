var _ = require('./lib/test'),
    resolveEquality = function(a, b) {
        return a.fork(
            function() {},
            function(x) {
                return b.fork(
                    function() {},
                    function(y) {
                        return _.expect(x).toBe(y);
                    }
                );
            }
        );
    };

exports.stream = {
    'when testing fork should call next correct number of times': _.check(
        function(a) {
            var accum = 0,
                stream = _.Stream.fromArray(a);
            stream.fork(
                function() {
                    accum += 1;
                },
                _.identity
            );
            return _.expect(accum).toBe(a.length);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing fork should call done correct number of times': _.check(
        function(a) {
            var accum = 0,
                stream = _.Stream.fromArray(a);
            stream.fork(
                _.identity,
                function() {
                    accum += 1;
                }
            );
            return _.expect(accum).toBe(1);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing map and then fork should call done correct number of times': _.check(
        function(a) {
            var accum = 0,
                stream = _.Stream.fromArray(a).map(
                    function(x) {
                        return a + 1;
                    }
                );
            stream.fork(
                _.identity,
                function() {
                    accum += 1;
                }
            );
            return _.expect(accum).toBe(1);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing equal and then fork should call done correct number of times': _.check(
        function(a) {
            var accum = 0,
                stream = _.Stream.fromArray(a).equal(_.Stream.fromArray(a));
            stream.fork(
                _.identity,
                function() {
                    accum += 1;
                }
            );
            return _.expect(accum).toBe(1);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing ap with the stream should dispatch all items': _.checkStream(
        function(a) {
            var binder = _.fill(a.length)(
                    function(v) {
                        return _.concat(v);
                    }
                ),
                x = _.Stream.fromArray(binder),
                y = _.Stream.fromArray(a),
                actual = x.ap(y),
                expected = _.Stream.fromArray(_.ap(binder, a));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing both with the stream should dispatch all items': _.checkStream(
        function(a, b, t) {
            var x = _.Stream.fromArray(a),
                y = _.Stream.fromArray(b),
                actual = x.both(y, t),
                both = function(a, b, t) {
                    var left = t._1,
                        right = t._2,
                        x = _.map(a, function(v) {
                            left = v;
                            return _.Tuple2.of(v, right);
                        }),
                        y = _.map(b, function(v) {
                            right = v;
                            return _.Tuple2.of(left, v);
                        });
                    return _.concat(x, y);
                },
                expected = _.Stream.fromArray(both(a, b, t));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal), _.tuple2Of(_.AnyVal, _.AnyVal)]
    ),
    'when testing concat with the stream should dispatch all items': _.checkStream(
        function(a, b) {
            var x = _.Stream.fromArray(a),
                y = _.Stream.fromArray(b),
                actual = x.concat(y),
                expected = _.Stream.fromArray(_.concat(a, b));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing drop with the stream should dispatch all items': _.checkStream(
        function(a) {
            var x = _.Stream.fromArray(a),
                len = a.length,
                rnd = Math.floor(_.randomRange(len || 1, len)),
                actual = x.drop(rnd),
                expected = _.Stream.fromArray(_.drop(a, rnd));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing equality with same stream should return true': _.checkStream(
        function(a) {
            return a.equal(a);
        },
        [_.streamOf(_.AnyVal)]
    ),
    'when testing extract with the stream should dispatch all items': _.check(
        function(a) {
            var actual = _.Stream.fromArray(a).extract();
            return _.expect(actual).toBe(null);
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing filter with the stream should dispatch all items': _.checkStream(
        function(a) {
            var actual = _.Stream.fromArray(a).filter(_.isEven),
                expected = _.Stream.fromArray(_.filter(a, _.isEven));

            return actual.equal(expected);
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing length with the stream should dispatch all items': _.checkStream(
        function(a) {
            var actual = _.Stream.fromArray(a).length(),
                expected = _.Stream.fromArray(a.length);

            return actual.equal(expected);
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing map with the stream should dispatch all items': _.checkStream(
        function(a) {
            var actual = _.Stream.fromArray(a).map(_.identity),
                expected = _.Stream.fromArray(_.map(a, _.identity));

            return actual.equal(expected);
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing merge with the stream should dispatch all items': _.checkStream(
        function(a, b) {
            var x = _.Stream.fromArray(a),
                y = _.Stream.fromArray(b),
                actual = x.merge(y),
                expected = _.Stream.fromArray(_.concat(a, b));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing pipe with the stream should dispatch all items': _.checkStream(
        function(a, b) {
            var x = _.Stream.fromArray(a),
                y = _.Stream(function (next, done) {
                    // Pretent to be a state/writer monad
                    x.pipe({
                        run: next
                    });
                }),
                expected = _.Stream.fromArray(a);

            return expected.equal(y);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing scan with the stream should dispatch all items': _.checkStream(
        function(a) {
            var x = _.Stream.fromArray(a),
                sum = function(a, b) {
                    return a + b;
                },
                inc = function(a) {
                    var x = 0;
                    return _.map(
                        a,
                        function(y) {
                            x = sum(x, y);
                            return x;
                        }
                    );
                },
                actual = x.scan(0, sum),
                expected = _.Stream.fromArray(inc(a));

            return actual.equal(expected);
        },
        [_.arrayOf(Number)]
    ),
    'when testing take with the stream should dispatch all items': _.checkStream(
        function(a) {
            var x = _.Stream.fromArray(a),
                rnd = _.randomRange(0, a.length),
                actual = x.take(rnd),
                expected = _.Stream.fromArray(_.take(a, rnd));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing zip with the stream should dispatch all items': _.checkStream(
        function(a, b) {
            var x = _.Stream.fromArray(a),
                y = _.Stream.fromArray(b),
                actual = x.zip(y),
                expected = _.Stream.fromArray(_.zip(a, b));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing zipWithIndex with the stream should dispatch all items': _.checkStream(
        function(a) {
            var x = _.Stream.fromArray(a),
                actual = x.zipWithIndex(),
                expected = _.Stream.fromArray(_.zipWithIndex(a));

            return actual.equal(expected);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when creating a stream and using lens should be correct value': _.check(
        function(a, b) {
            var fork = function(next, done) {
                    return done(b);
                },
                stream = _.Stream.lens().run(a).set(fork);

            return stream.fork(
                function(x) {},
                function(x) {
                    return _.expect(x).toBe(b);
                }
            );
        },
        [_.streamOf(_.AnyVal), _.AnyVal]
    )
};

exports.streamT = {
    'when testing streamT ap should return correct value': _.check(
        function(a) {
            var monad = _.Stream.of(a),
                transformer = _.Stream.StreamT(monad),
                actual = transformer(_.Stream.of(_.inc)).ap(transformer(monad)),
                expected = transformer(_.Stream.of(a + 1));

            return resolveEquality(actual, expected);
        },
        [_.AnyVal]
    ),
    'when testing streamT map should return correct value': _.check(
        function(a) {
            var streamT = _.Stream.StreamT(_.Stream.of(a)),
                actual = streamT(_.Stream.of(a)).map(_.inc),
                expected = streamT(_.Stream.of(a + 1));

            return resolveEquality(actual, expected);
        },
        [_.AnyVal]
    ),
    'when testing streamT chain should return correct value': _.check(
        function(a, b) {
            var streamT0 = _.Stream.StreamT(_.Stream.of(a)),
                streamT1 = _.Stream.StreamT(_.Stream.of(b)),
                actual = streamT0(_.Stream.of(a)).chain(
                    function() {
                        return streamT1(_.Stream.of(b));
                    }
                ),
                expected = streamT0(_.Stream.of(b));

            return resolveEquality(actual, expected);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a streamT and using chain should be correct value': _.check(
        function(a, b) {
            var monad = _.Stream.of(1),
                transformer = _.Stream.StreamT(monad),
                actual = transformer(_.Stream.of(b)).chain(function(x) {
                    return _.Stream.StreamT(monad).of(x + 1);
                }),
                expected = _.Stream.StreamT(monad).of(b + 1);

            return resolveEquality(actual, expected);
        },
        [Number, Number]
    ),
    'when creating a streamT using streamTOf and chain should be correct value': _.check(
        function(a, b) {
            var actual = a(_.Stream.of(b)).chain(function(x) {
                    return _.Stream.StreamT(_.Stream.of(1)).of(x + 1);
                }),
                expected = _.Stream.StreamT(_.Stream.of(1)).of(b + 1);

            return resolveEquality(actual, expected);
        },
        [_.streamTOf(Number), Number]
    ),
    'when creating a streamT using streamTOf and map should be correct value': _.check(
        function(a, b) {
            var actual = _.map(
                    a(_.Stream.of(b)),
                    function(x) {
                        return x + 1;
                    }
                ),
                expected = _.Stream.StreamT(_.Stream.of(1)).of(b + 1);

            return resolveEquality(actual, expected);
        },
        [_.streamTOf(Number), Number]
    )
};
