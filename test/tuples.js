var _ = require('./lib/test');

exports.tuple2 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple2,
        [_.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    ),
    'when testing tuple2 and calling flip should have correct first argument': _.check(
        function(a, b) {
            return _.expect(_.Tuple2(a, b).flip()._1).toBe(b);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing tuple2 and calling flip should have correct second argument': _.check(
        function(a, b) {
            return _.expect(_.Tuple2(a, b).flip()._2).toBe(a);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing tuple2 and calling concat should have correct arguments': _.check(
        function(a, b) {
            var expected = _.Tuple2(
                    _.concat(a._1, b._1),
                    _.concat(a._2, b._2)
                );
            return _.expect(a.concat(b)).toBe(expected);
        },
        [_.Tuple2, _.Tuple2]
    ),
    'when testing tuple2 and calling flatMap should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.flatMap(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.Tuple2, _.Tuple2]
    ),
    'when testing tuple2 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2]);
        },
        [_.Tuple2]
    )
};

exports.tuple3 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple3,
        [_.AnyVal, _.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    ),
    'when testing tuple3 and calling concat should have correct arguments': _.check(
        function(a, b) {
            var expected = _.Tuple3(
                    _.concat(a._1, b._1),
                    _.concat(a._2, b._2),
                    _.concat(a._3, b._3)
                );
            return _.expect(a.concat(b)).toBe(expected);
        },
        [_.Tuple3, _.Tuple3]
    ),
    'when testing tuple3 and calling flatMap should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.flatMap(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.Tuple3, _.Tuple3]
    ),
    'when testing tuple3 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2, a._3]);
        },
        [_.Tuple3]
    )
};

exports.tuple4 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple4,
        [_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    ),
    'when testing tuple4 and calling concat should have correct arguments': _.check(
        function(a, b) {
            var expected = _.Tuple4(
                    _.concat(a._1, b._1),
                    _.concat(a._2, b._2),
                    _.concat(a._3, b._3),
                    _.concat(a._4, b._4)
                );
            return _.expect(a.concat(b)).toBe(expected);
        },
        [_.Tuple4, _.Tuple4]
    ),
    'when testing tuple4 and calling flatMap should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.flatMap(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.Tuple4, _.Tuple4]
    ),
    'when testing tuple4 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2, a._3, a._4]);
        },
        [_.Tuple4]
    )
};

exports.tuple5 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple5,
        [_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    ),
    'when testing tuple5 and calling concat should have correct arguments': _.check(
        function(a, b) {
            var expected = _.Tuple5(
                    _.concat(a._1, b._1),
                    _.concat(a._2, b._2),
                    _.concat(a._3, b._3),
                    _.concat(a._4, b._4),
                    _.concat(a._5, b._5)
                );
            return _.expect(a.concat(b)).toBe(expected);
        },
        [_.Tuple5, _.Tuple5]
    ),
    'when testing tuple5 and calling flatMap should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.flatMap(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.Tuple5, _.Tuple5]
    ),
    'when testing tuple5 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2, a._3, a._4, a._5]);
        },
        [_.Tuple5]
    )
};

