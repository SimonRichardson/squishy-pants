var _ = require('./lib/test');

exports.eitherMatch = {
    testLeftMatch: _.check(
        function(a) {
            return _.left(a).match({
                left: function(b) {
                    return a === b;
                },
                right: _.badRight
            });
        },
        [_.AnyVal]
    ),
    testRightMatch: _.check(
        function(a) {
            return _.right(a).match({
                left: _.badLeft,
                right: function(b) {
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
            return _.left(a).value === a;
        },
        [_.AnyVal]
    ),
    testRight: _.check(
        function(a) {
            return _.right(a).value === a;
        },
        [_.AnyVal]
    ),
    testLeftIsEither: _.check(
        function(a) {
            return _.isEither(_.left(a));
        },
        [_.AnyVal]
    ),
    testRightIsEither: _.check(
        function(a) {
            return _.isEither(_.right(a));
        },
        [_.AnyVal]
    ),
    testLeftIsLeft: _.check(
        function(a) {
            return _.left(a).isLeft;
        },
        [_.AnyVal]
    ),
    testLeftIsNotRight: _.check(
        function(a) {
            return !_.left(a).isRight;
        },
        [_.AnyVal]
    ),
    testRightIsRight: _.check(
        function(a) {
            return _.right(a).isRight;
        },
        [_.AnyVal]
    ),
    testRightIsNotLeft: _.check(
        function(a) {
            return !_.right(a).isLeft;
        },
        [_.AnyVal]
    ),
    testLeftSwap: _.check(
        function(a) {
            return _.left(a).swap().isRight;
        },
        [_.AnyVal]
    ),
    testRightSwap: _.check(
        function(a) {
            return _.right(a).swap().isLeft;
        },
        [_.AnyVal]
    ),
    testLeftToOption: _.check(
        function(a) {
            return _.left(a).toOption().getOrElse(0) === 0;
        },
        [_.AnyVal]
    ),
    testRightToOption: _.check(
        function(a) {
            return _.right(a).toOption().getOrElse(0) === a;
        },
        [_.AnyVal]
    ),
    testLeftToArray: _.check(
        function(a) {
            return _.left(a).toArray().length === 0;
        },
        [_.AnyVal]
    ),
    testRightToArray: _.check(
        function(a) {
            return _.right(a).toArray()[0] === a;
        },
        [_.AnyVal]
    ),
    testLeftMap: _.check(
        function(a) {
            return _.left(a).map(_.inc).fold(_.identity, _.badRight) === a;
        },
        [Number]
    ),
    testRightMap: _.check(
        function(a) {
            return _.right(a).map(_.inc).fold(_.badLeft, _.identity) === a + 1;
        },
        [Number]
    ),
    testLeftFlatMap: _.check(
        function(a) {
            return _.left(a).flatMap(function(x) {
                return _.right(x + 1);
            }).flatMap(function(x) {
                return _.right(x + 1);
            }).fold(_.identity, _.badRight) === a;
        },
        [Number]
    ),
    testRightFlatMap: _.check(
        function(a) {
            return _.right(a).flatMap(function(x) {
                return _.right(x + 1);
            }).flatMap(function(x) {
                return _.right(x + 1);
            }).fold(_.badLeft, _.identity) === a + 2;
        },
        [Number]
    ),
    testRightLeftFlatMap: _.check(
        function(a) {
            return _.right(a).flatMap(function(x) {
                return _.left(x + 1);
            }).flatMap(function(x) {
                return _.right(x + 1);
            }).fold(_.identity, _.badRight) === a + 1;
        },
        [Number]
    ),
    testRightAp: _.check(
        function(a) {
            return _.right(_.inc).ap(_.right(a)).fold(_.badLeft, _.identity) === a + 1;
        },
        [Number]
    ),
    testRightLeftAp: _.check(
        function(a) {
            return _.right(_.inc).ap(_.left(a)).fold(_.identity, _.badRight) === a;
        },
        [Number]
    ),
    testLeftAp: _.check(
        function(a) {
            return _.left(_.inc).ap(_.right(a)).fold(_.identity, _.badRight) === _.inc;
        },
        [Number]
    )
};