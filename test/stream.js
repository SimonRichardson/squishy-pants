var _ = require('./lib/test');

exports.stream = {
    'when testing equality with same stream should return true': _.checkStream(
        function(a) {
            return a.equal(a);
        },
        [_.Stream],
        50
    )
};

exports.streamForeachTest = function(test) {
    var result = [];
    var s = _.Stream.sequential([1, 2, 3, 4]).foreach(function(a) {
        result.push(a);
    });

    setTimeout(function() {
        test.deepEqual(result, [1, 2, 3, 4]);
        test.done();
    }, 50);
};

exports.streamFilterTest = function(test) {
    var a = _.Stream.sequential([1, 2, 3, 4]).filter(_.isEven).toArray();

    setTimeout(function() {
        test.deepEqual(a, [2, 4]);
        test.done();
    }, 50);
};

exports.streamMapTest = function(test) {
    var a = _.Stream.sequential([1, 2, 3, 4]).map(function(a) {
        return a * 2;
    }).toArray();

    setTimeout(function() {
        test.deepEqual(a, [2, 4, 6, 8]);
        test.done();
    }, 50);
};

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
