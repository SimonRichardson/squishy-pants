var _ = require('./lib/test');

exports.stream = {
    'when testing concat with the stream should dispatch all items': _.checkStream(
        function(a, b) {
            var x = _.Stream.fromArray(a),
                y = _.Stream.fromArray(b),
                actual = x.concat(y),
                expected = _.Stream.fromArray(_.concat(a, b));

            return actual.equal(actual);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing drop with the stream should dispatch all items': _.checkStream(
        function(a) {
            var x = _.Stream.fromArray(a),
                rnd = _.randomRange(0, a.length),
                actual = x.drop(rnd),
                expected = _.Stream.fromArray(_.drop(a, rnd));

            return actual.equal(actual);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing equality with same stream should return true': _.checkStream(
        function(a) {
            return a.equal(a);
        },
        [_.Stream]
    ),
    'when testing filter with the stream should dispatch all items': _.checkStream(
        function(a) {
            var actual = _.Stream.fromArray(a).filter(_.isEven),
                expected = _.Stream.fromArray(_.filter(a, _.isEven));

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

            return actual.equal(actual);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing take with the stream should dispatch all items': _.checkStream(
        function(a) {
            var x = _.Stream.fromArray(a),
                rnd = _.randomRange(0, a.length),
                actual = x.take(rnd),
                expected = _.Stream.fromArray(_.take(a, rnd));

            return actual.equal(actual);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing zip with the stream should dispatch all items': _.checkStream(
        function(a, b) {
            var x = _.Stream.fromArray(a),
                y = _.Stream.fromArray(b),
                actual = x.zip(y),
                expected = _.Stream.fromArray(_.zip(a, b));

            return actual.equal(actual);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing zipWithIndex with the stream should dispatch all items': _.checkStream(
        function(a, b) {
            var x = _.Stream.fromArray(a),
                actual = x.zipWithIndex(),
                expected = _.Stream.fromArray(_.zipWithIndex(a));

            return actual.equal(actual);
        },
        [_.arrayOf(_.AnyVal)]
    )
};
