var _ = require('./../lib/test');

exports.stateT = {
    'when testing StateT with evalState should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State),
                y = x.of(a).run(b);

            return _.expect(y.evalState(c)).toBe(_.Tuple2(a, b));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing StateT with execState should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.Identity),
                y = x.of(a);
            return _.expect(y.execState(b)).toBe(b);
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing StateT ap should return correct value': _.check(
        function(a, b) {
            var x = _.State.StateT(_.State),
                y = x.of(function(v) {
                    return x.of(_.State.of(_.inc(v)));
                }).ap(a);

            return _.expect(y.evalState(a).run(b)).toBe(_.Tuple2(a + 1, b));
        },
        [_.Integer, _.Integer]
    ),
    'when testing StateT chain should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State),
                y = x.of(a).chain(function(v) {
                    return x.of(_.State.of(v));
                });

            return _.expect(y.evalState(c).run(b)).toBe(_.Tuple2(a, b));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing StateT map should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State),
                y = x.of(a).map(function(v) {
                    return _.State.of(v + 1);
                });

            return _.expect(y.evalState(c).run(b)).toBe(_.Tuple2(a + 1, b));
        },
        [_.Integer, _.AnyVal, _.AnyVal]
    ),
    'when testing StateT lift should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State);
            return _.expect(x.lift(_.State.of(a)).run(b).run(c)).toBe(_.Tuple2(a, c));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing StateT get should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State);
            return _.expect(x.get.run(a).run(b)).toBe(_.Tuple2(_.Tuple2(a, a), b));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing StateT modify should return correct value': _.check(
        function(a, b) {
            var x = _.State.StateT(_.State);
            return _.expect(x.modify(_.identity).run(a).run(b)).toBe(_.Tuple2(_.Tuple2(null, a), b));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing StateT put should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State);
            return _.expect(x.put(a).run(b).run(c)).toBe(_.Tuple2(_.Tuple2(null, a), c));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing StateT arb should return correct value': _.check(
        function(a, b) {
            return _.expect(a(b).run).toBe(b);
        },
        [_.stateTOf(_.stateOf(_.AnyVal)), _.AnyVal]
    )
};