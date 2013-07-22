var _ = require('./lib/test');

exports.eitherMatch = {
    testLeftMatch: _.check(
        function(a) {
            return _.left(a).match({
                left: function(b) {
                    return a === b;
                },
                right: function() {
                    return false;
                }
            });
        },
        [_.AnyVal]
    ),
    testRightMatch: _.check(
        function(a) {
            return _.right(a).match({
                left: function() {
                    return false;
                },
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
    )
};