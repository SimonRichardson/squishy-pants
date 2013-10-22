var _ = require('./lib/test');

exports.state = {
    'when testing ap with state should return correct value': _.check(
        function(a, b) {
            var x = _.State.of(_.concat(a)),
                y = x.ap(_.State.of(b));

            return _.expect(y.run(_.Tuple2(0, 0))._1).toBe(_.concat(a, b));
        },
        [_.Integer, _.Integer]
    ),
    'when testing chain with state should return correct value': _.check(
        function(a) {
            var x = _.State.of(a),
                y = x.chain(function(a) {
                    return _.State.of(a + 1);
                });

            return _.expect(y.run(_.Tuple2(0, 0))._1).toBe(a + 1);
        },
        [_.Integer]
    ),
    'when testing evalState with state should return correct value': _.check(
        function(a, b) {
            var x = _.State.of(a),
                y = x.chain(function(a) {
                    return _.State.of(a + 1);
                });

            return _.expect(y.evalState(b)).toBe(a + 1);
        },
        [_.Integer, _.tuple2Of(_.Integer, _.Integer)]
    ),
    'when testing execState with state should return correct value': _.check(
        function(a, b) {
            var x = _.State.of(a),
                y = x.chain(function(a) {
                    return _.State.of(a + 1);
                });

            return _.expect(y.execState(b)).toBe(b);
        },
        [_.Integer, _.tuple2Of(_.Integer, _.Integer)]
    ),
    'when testing map with state should return correct value': _.check(
        function(a, b) {
            var x = _.State.of(a),
                y = x.map(function(a) {
                    return a + 1;
                });

            return _.expect(y.evalState(b)).toBe(a + 1);
        },
        [_.Integer, _.tuple2Of(_.Integer, _.Integer)]
    ),
    'when creating a state and using lens should be correct value': _.check(
        function(a, b, c) {
            var run = function(x) {
                    return _.Tuple2.of(b, x);
                },
                state = _.State.lens().run(a).set(run);

            return _.expect(state.run(c)).toBe(_.Tuple2.of(b, c));
        },
        [_.stateOf(_.AnyVal), _.AnyVal, _.AnyVal]
    ),
    'when creating a state and using lens get should be correct value': _.check(
        function(a, b) {
            var state = _.State.of(a),
                result = _.State.lens().run(state).get();

            return _.expect(state.run(b)).toBe(_.Tuple2.of(a, b));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing of should return correct value': _.check(
        function(a, b) {
            var state = _.of(_.State, a);
            return _.expect(state.run(b)).toBe(_.Tuple2.of(a, b));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing empty should return correct value': _.check(
        function(a, b) {
            var state = _.empty(_.State);
            return _.expect(state.run(b)).toBe(_.Tuple2.of(null, b));
        },
        [_.AnyVal]
    ),
    'when testing ap should return correct value': _.check(
        function(a, b) {
            var x = _.State.of(_.concat(a)),
                y = x.ap(_.State.of(b)),
                z = _.ap(x, _.State.of(b));

            return _.expect(z.execState(_.Tuple2(0, 0))).toBe(y.execState(_.Tuple2(0, 0)));
        },
        [_.Integer, _.Integer]
    ),
    'when testing chain should return correct value': _.check(
        function(a) {
            var x = _.State.of(a),
                y = x.chain(function(a) {
                    return _.State.of(a + 1);
                }),
                z = _.chain(x, function(a) {
                    return _.State.of(a + 1);
                });

            return _.expect(z.execState(_.Tuple2(0, 0))).toBe(y.execState(_.Tuple2(0, 0)));
        },
        [_.Integer]
    ),
    'when creating a state and testing shrink should be correct value': _.check(
        function(a) {
            return _.expect(_.shrink(a)).toBe([]);
        },
        [_.stateOf(_.AnyVal)]
    )
};


exports.stateT = {
    'when testing stateT should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State),
                y = x.of(a).run(b);

            return _.expect(y.evalState(c)).toBe(_.Tuple2(a, b));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),/*
    'when testing stateT ap should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State),
                y = x.of(_.concat(a)).ap(b);

            console.log('>>', y.evalState(c));

            return _.expect(y.evalState(c)).toBe(_.Tuple2(_.Tuple2(a + b, b), c));
        },
        [_.Integer, _.Integer, _.Integer]
    ),*/
    'when testing stateT chain should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State),
                y = x.of(a).chain(function(v) {
                    return x.of(_.State.of(v));
                });

            return _.expect(y.evalState(c).run(b)).toBe(_.Tuple2(a, b));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing stateT map should return correct value': _.check(
        function(a, b, c) {
            var x = _.State.StateT(_.State),
                y = x.of(a).map(function(v) {
                    return _.State.of(v + 1);
                });

            return _.expect(y.evalState(c).run(b)).toBe(_.Tuple2(a + 1, b));
        },
        [_.Integer, _.AnyVal, _.AnyVal]
    )
};
