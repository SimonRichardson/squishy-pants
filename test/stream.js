var _ = require('./lib/test');

exports.stream = {
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
    )
};
/*
exports.streamZipTest = function(test) {
    var a = _.Stream.sequential([1, 3, 5, 7]);
    var b = _.Stream.sequential([2, 4, 6, 8]);
    var c = a.zip(b).toArray();

    setTimeout(function() {
        test.deepEqual(c, [_.Tuple2(1, 2), _.Tuple2(3, 4), _.Tuple2(5, 6), _.Tuple2(7, 8)]);
        test.done();
    }, 50);
};

exports.streamZipDelayedTest = function(test) {
    var a = _.Stream.sequential([1, 3, 5, 7]);
    var b = _.Stream.sequential([2, 4, 6, 8], 10);
    var c = a.zip(b).toArray();

    setTimeout(function() {
        test.deepEqual(c, [_.Tuple2(1, 2), _.Tuple2(3, 4), _.Tuple2(5, 6), _.Tuple2(7, 8)]);
        test.done();
    }, 500);
};

exports.streamZipDelayedWithMapTest = function(test) {
    var a = _.Stream.sequential([1, 3, 5, 7]);
    var b = _.Stream.sequential([2, 4, 6, 8], 10);
    var c = a.zip(b).map(_.identity).toArray();

    setTimeout(function() {
        test.deepEqual(c, [_.Tuple2(1, 2), _.Tuple2(3, 4), _.Tuple2(5, 6), _.Tuple2(7, 8)]);
        test.done();
    }, 500);
};

exports.streamPromiseSuccessTest = function(test) {
    var a = _.Stream.promise(_.Promise.of(41)).toArray();

    setTimeout(function() {
        test.deepEqual(a, [_.Success(41)]);
        test.done();
    }, 50);
};

exports.streamPromiseFailureTest = function(test) {
    var a = _.Stream.promise(_.Promise.error(41)).toArray();

    setTimeout(function() {
        test.deepEqual(a, [_.Failure(41)]);
        test.done();
    }, 50);
};
*/