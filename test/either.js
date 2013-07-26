var _ = require('./lib/test');

exports.eitherMatch = {
    testLeftMatch: _.check(
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
    testRightMatch: _.check(
        function(a) {
            return _.Right(a).match({
                Left: _.badLeft,
                Right: function(b) {
                    return a === b;
                }
            });
        },
        [_.AnyVal]
    )
};

exports.either = {
    testLeft: _.check(
        function(a) {
            return _.Left(a).value === a;
        },
        [_.AnyVal]
    ),
    testRight: _.check(
        function(a) {
            return _.Right(a).value === a;
        },
        [_.AnyVal]
    ),
    testLeftIsEither: _.check(
        function(a) {
            return _.isEither(_.Left(a));
        },
        [_.AnyVal]
    ),
    testRightIsEither: _.check(
        function(a) {
            return _.isEither(_.Right(a));
        },
        [_.AnyVal]
    ),
    testLeftIsLeft: _.check(
        function(a) {
            return _.Left(a).isLeft;
        },
        [_.AnyVal]
    ),
    testLeftIsNotRight: _.check(
        function(a) {
            return !_.Left(a).isRight;
        },
        [_.AnyVal]
    ),
    testRightIsRight: _.check(
        function(a) {
            return _.Right(a).isRight;
        },
        [_.AnyVal]
    ),
    testRightIsNotLeft: _.check(
        function(a) {
            return !_.Right(a).isLeft;
        },
        [_.AnyVal]
    ),
    testLeftSwap: _.check(
        function(a) {
            return _.Left(a).swap().isRight;
        },
        [_.AnyVal]
    ),
    testRightSwap: _.check(
        function(a) {
            return _.Right(a).swap().isLeft;
        },
        [_.AnyVal]
    ),
    testLeftToOption: _.check(
        function(a) {
            return _.Left(a).toOption().getOrElse(0) === 0;
        },
        [_.AnyVal]
    ),
    testRightToOption: _.check(
        function(a) {
            return _.Right(a).toOption().getOrElse(0) === a;
        },
        [_.AnyVal]
    ),
    testLeftToArray: _.check(
        function(a) {
            return _.Left(a).toArray().length === 0;
        },
        [_.AnyVal]
    ),
    testRightToArray: _.check(
        function(a) {
            return _.Right(a).toArray()[0] === a;
        },
        [_.AnyVal]
    ),
    testLeftMap: _.check(
        function(a) {
            return _.Left(a).map(_.inc).fold(_.identity, _.badRight) === a;
        },
        [Number]
    ),
    testRightMap: _.check(
        function(a) {
            return _.Right(a).map(_.inc).fold(_.badLeft, _.identity) === a + 1;
        },
        [Number]
    ),
    testLeftFlatMap: _.check(
        function(a) {
            return _.Left(a).flatMap(function(x) {
                return _.Right(x + 1);
            }).flatMap(function(x) {
                return _.Right(x + 1);
            }).fold(_.identity, _.badRight) === a;
        },
        [Number]
    ),
    testRightFlatMap: _.check(
        function(a) {
            return _.Right(a).flatMap(function(x) {
                return _.Right(x + 1);
            }).flatMap(function(x) {
                return _.Right(x + 1);
            }).fold(_.badLeft, _.identity) === a + 2;
        },
        [Number]
    ),
    testRightLeftFlatMap: _.check(
        function(a) {
            return _.Right(a).flatMap(function(x) {
                return _.Left(x + 1);
            }).flatMap(function(x) {
                return _.Right(x + 1);
            }).fold(_.identity, _.badRight) === a + 1;
        },
        [Number]
    ),
    testRightAp: _.check(
        function(a) {
            return _.Right(_.inc).ap(_.Right(a)).fold(_.badLeft, _.identity) === a + 1;
        },
        [Number]
    ),
    testRightLeftAp: _.check(
        function(a) {
            return _.Right(_.inc).ap(_.Left(a)).fold(_.identity, _.badRight) === a;
        },
        [Number]
    ),
    testLeftAp: _.check(
        function(a) {
            return _.Left(_.inc).ap(_.Right(a)).fold(_.identity, _.badRight) === _.inc;
        },
        [Number]
    )
};