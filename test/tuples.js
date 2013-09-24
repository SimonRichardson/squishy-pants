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
        [_.tuple2Of(_.AnyVal, _.AnyVal), _.tuple2Of(_.AnyVal, _.AnyVal)]
    ),
    'when testing tuple2 and calling chain should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.chain(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.tuple2Of(_.AnyVal, _.AnyVal), _.tuple2Of(_.AnyVal, _.AnyVal)]
    ),
    'when testing tuple2 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2]);
        },
        [_.tuple2Of(_.AnyVal, _.AnyVal)]
    ),
    'when testing Tuple2.lens should return correct value for index 0': _.check(
        function(a, b) {
            return _.expect(_.Tuple2.lens(0).run(a).set(b)).toBe(_.Tuple2.of(b, a._2));
        },
        [_.tuple2Of(_.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple2.lens should return correct value for index 1': _.check(
        function(a, b) {
            return _.expect(_.Tuple2.lens(1).run(a).set(b)).toBe(_.Tuple2.of(a._1, b));
        },
        [_.tuple2Of(_.AnyVal, _.AnyVal), _.AnyVal]
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
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal), _.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tuple3 and calling chain should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.chain(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal), _.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tuple3 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2, a._3]);
        },
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing Tuple3.lens should return correct value for index 0': _.check(
        function(a, b) {
            return _.expect(_.Tuple3.lens(0).run(a).set(b)).toBe(_.Tuple3.of(b, a._2, a._3));
        },
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple3.lens should return correct value for index 1': _.check(
        function(a, b) {
            return _.expect(_.Tuple3.lens(1).run(a).set(b)).toBe(_.Tuple3.of(a._1, b, a._3));
        },
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple3.lens should return correct value for index 2': _.check(
        function(a, b) {
            return _.expect(_.Tuple3.lens(2).run(a).set(b)).toBe(_.Tuple3.of(a._1, a._2, b));
        },
        [_.tuple3Of(_.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
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
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tuple4 and calling chain should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.chain(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tuple4 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2, a._3, a._4]);
        },
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing Tuple4.lens should return correct value for index 0': _.check(
        function(a, b) {
            return _.expect(_.Tuple4.lens(0).run(a).set(b)).toBe(_.Tuple4.of(b, a._2, a._3, a._4));
        },
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple4.lens should return correct value for index 1': _.check(
        function(a, b) {
            return _.expect(_.Tuple4.lens(1).run(a).set(b)).toBe(_.Tuple4.of(a._1, b, a._3, a._4));
        },
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple4.lens should return correct value for index 2': _.check(
        function(a, b) {
            return _.expect(_.Tuple4.lens(2).run(a).set(b)).toBe(_.Tuple4.of(a._1, a._2, b, a._4));
        },
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple4.lens should return correct value for index 3': _.check(
        function(a, b) {
            return _.expect(_.Tuple4.lens(3).run(a).set(b)).toBe(_.Tuple4.of(a._1, a._2, a._3, b));
        },
        [_.tuple4Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
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
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tuple5 and calling chain should have correct arguments': _.check(
        function(a, b) {
            return _.expect(a.chain(
                    function() {
                        return b;
                    }
                )).toBe(b);
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing tuple5 and calling toArray should have correct arguments': _.check(
        function(a) {
            return _.expect(a.toArray()).toBe([a._1, a._2, a._3, a._4, a._5]);
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal)]
    ),
    'when testing Tuple5.lens should return correct value for index 0': _.check(
        function(a, b) {
            return _.expect(_.Tuple5.lens(0).run(a).set(b)).toBe(_.Tuple5.of(b, a._2, a._3, a._4, a._5));
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple5.lens should return correct value for index 1': _.check(
        function(a, b) {
            return _.expect(_.Tuple5.lens(1).run(a).set(b)).toBe(_.Tuple5.of(a._1, b, a._3, a._4, a._5));
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple5.lens should return correct value for index 2': _.check(
        function(a, b) {
            return _.expect(_.Tuple5.lens(2).run(a).set(b)).toBe(_.Tuple5.of(a._1, a._2, b, a._4, a._5));
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple5.lens should return correct value for index 3': _.check(
        function(a, b) {
            return _.expect(_.Tuple5.lens(3).run(a).set(b)).toBe(_.Tuple5.of(a._1, a._2, a._3, b, a._5));
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    ),
    'when testing Tuple5.lens should return correct value for index 4': _.check(
        function(a, b) {
            return _.expect(_.Tuple5.lens(4).run(a).set(b)).toBe(_.Tuple5.of(a._1, a._2, a._3, a._4, b));
        },
        [_.tuple5Of(_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal), _.AnyVal]
    )
};

