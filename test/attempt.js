var _ = require('./lib/test');

exports.attempt = {
    'when testing success with match should call success function': _.check(
        function(a) {
            return _.success(a).match({
                success: function(b) {
                    return a === b;
                },
                failure: _.badRight
            });
        },
        [_.AnyVal]
    ),
    'when testing failure with match should call failure function': _.check(
        function(a) {
            return _.failure(a).match({
                success: _.badLeft,
                failure: function(b) {
                    return a === b;
                }
            });
        },
        [String]
    ),
    'when creating success with value should set value on success': _.check(
        function(a) {
            return _.success(a).value === a;
        },
        [_.AnyVal]
    ),
    'when creating success should be valid attempt': _.check(
        function(a) {
            return _.isAttempt(_.success(a));
        },
        [_.AnyVal]
    ),
    'when creating success should be success': _.check(
        function(a) {
            return _.success(a).isSuccess;
        },
        [_.AnyVal]
    ),
    'when creating success should not be failure': _.check(
        function(a) {
            return !_.success(a).isFailure;
        },
        [_.AnyVal]
    ),
    'when creating success and mapping value should map to correct value': _.check(
        function(a) {
            return _.success(a).map(_.inc).value === a + 1;
        },
        [Number]
    ),
    'when creating success and folding should map to correct value': _.check(
        function(a) {
            return _.success(a).fold(
                _.inc,
                _.error('Failed if called')
            ) === a + 1;
        },
        [Number]
    ),
    'when creating a failure with value should set errors on failure': _.check(
        function(a) {
            return _.failure(a).errors === a;
        },
        [_.AnyVal]
    ),
    'when creating failure should be valid attempt': _.check(
        function(a) {
            return _.isAttempt(_.failure(a));
        },
        [_.AnyVal]
    ),
    'when creating failure should be failure': _.check(
        function(a) {
            return _.failure(a).isFailure;
        },
        [_.AnyVal]
    ),
    'when creating failure should not be success': _.check(
        function(a) {
            return !_.failure(a).isSuccess;
        },
        [_.AnyVal]
    ),
    'when creating failure and mapping value should not call map': _.check(
        function(a) {
            return _.failure(a).map(
                _.error('Failed if called')
            ).errors === a;
        },
        [_.AnyVal]
    ),
    'when creating failure and folding should map to correct value': _.check(
        function(a) {
            return _.failure(a).fold(
                _.error('Failed if called'),
                _.inc
            ) === a + 1;
        },
        [Number]
    ),
    'when creating success and calling ap with a success should concat to correct value': _.check(
        function(a, b) {
            return _.success(
                _.constant(a)
            ).ap(
                _.success(b),
                _.concat
            ).value === a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating success and calling ap with a failure should concat to correct value': _.check(
        function(a, b) {
            return _.success(
                _.constant(a)
            ).ap(
                _.failure(b),
                _.concat
            ).errors.toString() === b.toString();
        },
        [_.AnyVal, _.arrayOf(_.AnyVal)]
    ),
    'when creating failure and calling ap with a success should concat to correct value': _.check(
        function(a, b) {
            return _.failure(a).ap(
                _.success(b),
                _.concat
            ).errors.toString() === a.toString();
        },
        [_.arrayOf(_.AnyVal), _.AnyVal]
    ),
    'when creating failure and calling ap with a failure should concat to correct value': _.check(
        function(a, b) {
            var errors = _.failure(a).ap(
                _.failure(b),
                _.concat
            ).errors;
            // FIXME (Simon) : Implement equals.
            return errors.toString() === a.concat(b).toString();
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    )
};
