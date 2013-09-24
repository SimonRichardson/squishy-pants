var _ = require('./lib/test');

exports.either = {
    'when testing left with match should call left function': _.check(
        function(a) {
            return _.Left(a).match({
                Left: function(b) {
                    return a === b;
                },
                Right: _.badRight
            });
        },
        [_.AnyVal]
    ),
    'when testing right with match should call right function': _.check(
        function(a) {
            return _.Right(a).match({
                Left: _.badLeft,
                Right: function(b) {
                    return a === b;
                }
            });
        },
        [_.AnyVal]
    ),
    'when creating left with value should set value on left': _.check(
        function(a) {
            return _.expect(_.Left(a).value).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating right with value should set value on right': _.check(
        function(a) {
            return _.expect(_.Right(a).value).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating left should be valid either': _.check(
        function(a) {
            return _.isEither(_.Left(a));
        },
        [_.AnyVal]
    ),
    'when creating right should be valid either': _.check(
        function(a) {
            return _.isEither(_.Right(a));
        },
        [_.AnyVal]
    ),
    'when creating left should be left': _.check(
        function(a) {
            return _.Left(a).isLeft;
        },
        [_.AnyVal]
    ),
    'when creating left should not be right': _.check(
        function(a) {
            return !_.Left(a).isRight;
        },
        [_.AnyVal]
    ),
    'when creating right should be right': _.check(
        function(a) {
            return _.Right(a).isRight;
        },
        [_.AnyVal]
    ),
    'when creating right should not be left': _.check(
        function(a) {
            return !_.Right(a).isLeft;
        },
        [_.AnyVal]
    ),
    'when creating left and calling swap should be right': _.check(
        function(a) {
            return _.Left(a).swap().isRight;
        },
        [_.AnyVal]
    ),
    'when creating left and calling swap should be correct value': _.check(
        function(a) {
            return _.expect(_.Left(a).swap().value).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating right and calling swap should be left': _.check(
        function(a) {
            return _.Right(a).swap().isLeft;
        },
        [_.AnyVal]
    ),
    'when creating right and calling swap should be correct value': _.check(
        function(a) {
            return _.expect(_.Right(a).swap().value).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating left and calling toOption should be default value': _.check(
        function(a) {
            return _.Left(a).toOption().getOrElse(0) === 0;
        },
        [_.AnyVal]
    ),
    'when creating right and calling toOption should be correct value': _.check(
        function(a) {
            return _.Right(a).toOption().getOrElse(0) === a;
        },
        [_.AnyVal]
    ),
    'when creating left and calling toArray should be correct value': _.check(
        function(a) {
            return _.expect(_.Left(a).toArray()).toBe([]);
        },
        [_.AnyVal]
    ),
    'when creating right and calling toArray should be correct value': _.check(
        function(a) {
            return _.expect(_.Right(a).toArray()).toBe([a]);
        },
        [_.AnyVal]
    ),
    'when creating left and calling map with fold should be correct value': _.check(
        function(a) {
            return _.expect(_.Left(a).map(_.inc).fold(_.identity, _.badRight)).toBe(a);
        },
        [Number]
    ),
    'when creating right and calling map with fold should be correct value': _.check(
        function(a) {
            return _.expect(_.Right(a).map(_.inc).fold(_.badRight, _.identity)).toBe(a + 1);
        },
        [Number]
    ),
    'when creating left and calling chain with right should be correct value': _.check(
        function(a) {
            return _.expect(
                _.Left(a).chain(
                    function(x) {
                        return _.Right(x + 1);
                    }
                ).chain(
                    function(x) {
                        return _.Right(x + 1);
                    }
                ).fold(
                    _.identity,
                    _.badRight
                )
            ).toBe(a);
        },
        [Number]
    ),
    'when creating right and calling chain with right should be correct value': _.check(
        function(a) {
            return _.expect(
                _.Right(a).chain(
                    function(x) {
                        return _.Right(x + 1);
                    }
                ).chain(
                    function(x) {
                        return _.Right(x + 1);
                    }
                ).fold(
                    _.badRight,
                    _.identity
                )
            ).toBe(a + 2);
        },
        [Number]
    ),
    'when creating right and calling chain with left should be correct value': _.check(
        function(a) {
            return _.expect(
                _.Right(a).chain(
                    function(x) {
                        return _.Left(x + 1);
                    }
                ).chain(
                    function(x) {
                        return _.Right(x + 1);
                    }
                ).fold(
                    _.identity,
                    _.badRight
                )
            ).toBe(a + 1);
        },
        [Number]
    ),
    'when creating right and calling ap with right should be correct value': _.check(
        function(a) {
            return _.expect(_.Right(_.inc).ap(_.Right(a)).fold(_.badLeft, _.identity)).toBe(a + 1);
        },
        [Number]
    ),
    'when creating right and calling ap with left should be correct value': _.check(
        function(a) {
            return _.expect(_.Right(_.inc).ap(_.Left(a)).fold(_.identity, _.badRight)).toBe(a);
        },
        [Number]
    ),
    'when creating left and calling ap with right should be correct value': _.check(
        function(a) {
            return _.expect(_.Left(_.inc).ap(_.Right(a)).fold(_.identity, _.badRight)).toBe(_.inc);
        },
        [Number]
    ),
    'when creating left and calling equal with same value in left should return true': _.check(
        function(a) {
            return a.equal(a);
        },
        [_.leftOf(_.AnyVal)]
    ),
    'when creating right and calling equal with same value in right should return true': _.check(
        function(a) {
            return a.equal(a);
        },
        [_.rightOf(_.AnyVal)]
    ),
    'when creating left and calling equal with right should return false': _.check(
        function(a, b) {
            return !a.equal(b);
        },
        [_.leftOf(_.AnyVal), _.rightOf(_.AnyVal)]
    ),
    'when creating left and calling equal with same value in right should return false': _.check(
        function(a) {
            return !_.Left(a).equal(_.Right(a));
        },
        [_.AnyVal]
    ),
    'when creating left and calling concat with right should return correct value': _.check(
        function(a) {
            return _.expect(_.Left(a).concat(_.Right(a), _.concat).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating left and calling concat with left should return correct value': _.check(
        function(a) {
            return _.expect(_.Left(a).concat(_.Left(a), _.concat).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating right and calling concat with left should return correct value': _.check(
        function(a) {
            return _.expect(_.Right(a).concat(_.Left(a), _.concat).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating right and calling concat with right should return correct value': _.check(
        function(a) {
            return _.expect(_.Right(a).concat(_.Right(a), _.concat).extract()).toBe(a.concat(a));
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when creating a left and using lens should be correct value': _.check(
        function(a, b) {
            return _.expect(_.Either.lens().run(a).set(b)).toBe(_.Left(b));
        },
        [_.leftOf(_.AnyVal), _.AnyVal]
    ),
    'when creating a right and using lens should be correct value': _.check(
        function(a, b) {
            return _.expect(_.Either.lens().run(a).set(b)).toBe(_.Right(b));
        },
        [_.rightOf(_.AnyVal), _.AnyVal]
    )
};
