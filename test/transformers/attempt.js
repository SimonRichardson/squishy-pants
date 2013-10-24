var _ = require('./../lib/test');

exports.attemptT = {
    'when testing that calling run should return same value': _.check(
        function(a) {
            var transformer = _.Attempt.AttemptT(_.Attempt);
            return _.expect(transformer(_.Success(a)).run).toBe(_.Success(a));
        },
        [_.AnyVal]
    )/*,
    'when testing attemptT ap with success should return correct value': _.check(
        function(a) {
            var monad = _.Success(a),
                transformer = _.Attempt.AttemptT(monad),
                actual = transformer(_.Success(_.inc)).ap(transformer(monad));

            return _.expect(actual).toBe(transformer(_.Success(a + 1)));
        },
        [_.AnyVal]
    ),
    'when testing attemptT map with success should return correct value': _.check(
        function(a) {
            var attemptT = _.Attempt.AttemptT(_.Success(a)),
                actual = attemptT(_.Success(a)).map(_.inc),
                expected = attemptT(_.Success(a + 1));

            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal]
    ),
    'when testing attemptT chain with success should return correct value': _.check(
        function(a, b) {
            var attemptT0 = _.Attempt.AttemptT(_.Success(a)),
                attemptT1 = _.Attempt.AttemptT(_.Success(b)),
                actual = attemptT0(_.Success(a)).chain(
                    function() {
                        return attemptT1(_.Success(b));
                    }
                ),
                expected = attemptT0(_.Success(b));

            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing attemptT ap with failure should return correct value': _.check(
        function(a) {
            var monad = _.Failure(a),
                transformer = _.Attempt.AttemptT(monad),
                actual = transformer(_.Failure(a)).ap(transformer(monad));

            return _.expect(actual).toBe(transformer(_.Failure(a)));
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing attemptT map with failure should return correct value': _.check(
        function(a) {
            var attemptT = _.Attempt.AttemptT(_.Failure(a)),
                actual = attemptT(_.Failure(a)).map(_.inc),
                expected = attemptT(_.Failure(a));

            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal]
    ),
    'when testing attemptT chain with failure should return correct value': _.check(
        function(a, b) {
            var attemptT0 = _.Attempt.AttemptT(_.Failure(a)),
                actual = attemptT0(_.Failure(a)).chain(
                    function() {
                        _.error('Failed if called')();
                    }
                ),
                expected = attemptT0(_.Failure(a));

            return _.expect(actual).toBe(expected);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a attemptT and using chain should be correct value': _.check(
        function(a, b) {
            var monad = _.Attempt.of(1),
                transformer = _.Attempt.AttemptT(monad);

            return _.expect(
                transformer(_.Attempt.of(b)).chain(function(x) {
                    return _.Attempt.AttemptT(monad).of(x + 1);
                })
            ).toBe(_.Attempt.AttemptT(monad).of(b + 1));
        },
        [Number, Number]
    ),
    'when creating a attemptT using attemptTOf and chain should be correct value': _.check(
        function(a, b) {
            return _.expect(
                a(_.Attempt.of(b)).chain(function(x) {
                    return _.Attempt.AttemptT(_.Attempt.of(1)).of(x + 1);
                })
            ).toBe(_.Attempt.AttemptT(_.Attempt.of(1)).of(b + 1));
        },
        [_.attemptTOf(Number), Number]
    ),
    'when creating a attemptT using attemptTOf and map should be correct value': _.check(
        function(a, b) {
            return _.expect(
                _.map(
                    a(_.Attempt.of(b)),
                    function(x) {
                        return x + 1;
                    }
                )
            ).toBe(_.Attempt.AttemptT(_.Attempt.of(1)).of(b + 1));
        },
        [_.attemptTOf(Number), Number]
    )*/
};
