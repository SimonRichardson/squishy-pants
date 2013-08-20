var _ = require('./lib/test');

exports.partial = {
    'when creating partial should match method with apply and return correct value': _.check(
        function(a) {
            return _.partial()
                .method(_.isEven, _.constant('a'))
                .method(_.isOdd, _.constant('b'))
                .apply(null, [a]) === (a % 2) === 0 ? 'a' : 'b';
        },
        [_.Integer]
    ),
    'when creating partial should not match method with apply and return correct value': _.check(
        function(a) {
            return _.partial()
                .method(_.isString, _.error('Failed if called'))
                .apply(null, [a]) === null;
        },
        [_.Integer]
    ),
    'when creating partial should match method with call and return correct value': _.check(
        function(a) {
            return _.partial()
                .method(_.isEven, _.constant('a'))
                .method(_.isOdd, _.constant('b'))
                .call(null, a) === (a % 2) === 0 ? 'a' : 'b';
        },
        [_.Integer]
    ),
    'when creating partial should not match method with call and return correct value': _.check(
        function(a) {
            return _.partial()
                .method(_.isString, _.error('Failed if called'))
                .call(null, a) === null;
        },
        [_.Integer]
    ),
    'when creating partial should match method with isDefinedAt and return true': _.check(
        function(a) {
            return _.partial()
                .method(_.isEven, _.constant('a'))
                .method(_.isOdd, _.constant('b'))
                .isDefinedAt(a);
        },
        [_.Integer]
    ),
    'when creating partial should not match method with isDefinedAt and return false': _.check(
        function(a) {
            return !_.partial()
                .method(_.isString, _.error('Failed if called'))
                .isDefinedAt(a);
        },
        [_.Integer]
    )
};