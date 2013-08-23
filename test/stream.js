var _ = require('./lib/test');

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
        [_.Stream]
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
    )
};
