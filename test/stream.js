var _ = require('./lib/test');

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
        test.deepEqual(c, [[1, 2], [3, 4], [5, 6], [7, 8]]);
        test.done();
    }, 50);
};

exports.streamZipDelayedTest = function(test) {
    var a = _.Stream.sequential([1, 3, 5, 7]);
    var b = _.Stream.sequential([2, 4, 6, 8], 10);
    var c = a.zip(b).toArray();

    setTimeout(function() {
        test.deepEqual(c, [[1, 2], [3, 4], [5, 6], [7, 8]]);
        test.done();
    }, 500);
};

exports.streamZipDelayedWithMapTest = function(test) {
    var a = _.Stream.sequential([1, 3, 5, 7]);
    var b = _.Stream.sequential([2, 4, 6, 8], 10);
    var c = a.zip(b).map(_.identity).toArray();

    setTimeout(function() {
        test.deepEqual(c, [[1, 2], [3, 4], [5, 6], [7, 8]]);
        test.done();
    }, 500);
};

exports.streamPromiseSuccessTest = function(test) {
    var a = _.Stream.promise(_.Promise.of(41)).toArray();

    setTimeout(function() {
        test.deepEqual(a, [_.success(41)]);
        test.done();
    }, 50);
};

exports.streamPromiseFailureTest = function(test) {
    var a = _.Stream.promise(_.Promise.error(41)).toArray();

    setTimeout(function() {
        test.deepEqual(a, [_.failure(41)]);
        test.done();
    }, 50);
};
