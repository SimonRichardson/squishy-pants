var _ = require('./lib/test');

exports.attempt = {
    'when testing success with match should call success function': _.check(
        function(a) {
            return _.Success(a).match({
                Success: function(b) {
                    return _.expect(a).toBe(b);
                },
                Failure: _.badRight
            });
        },
        [_.AnyVal]
    ),
    'when testing failure with match should call failure function': _.check(
        function(a) {
            return _.Failure(a).match({
                Success: _.badLeft,
                Failure: function(b) {
                    return _.expect(a).toBe(b);
                }
            });
        },
        [String]
    ),
    'when creating success with value should set value on success': _.check(
        function(a) {
            return _.expect(_.Success(a).value).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating success should be valid attempt': _.check(
        function(a) {
            return _.isAttempt(_.Success(a));
        },
        [_.AnyVal]
    ),
    'when creating success should be success': _.check(
        function(a) {
            return _.Success(a).isSuccess;
        },
        [_.AnyVal]
    ),
    'when creating success should not be failure': _.check(
        function(a) {
            return !_.Success(a).isFailure;
        },
        [_.AnyVal]
    ),
    'when creating success and mapping value should map to correct value': _.check(
        function(a) {
            return _.expect(_.Success(a).map(_.inc).value).toBe(a + 1);
        },
        [Number]
    ),
    'when creating success and folding should map to correct value': _.check(
        function(a) {
            return _.expect(_.Success(a).fold(
                _.inc,
                _.error('Failed if called')
            )).toBe(a + 1);
        },
        [Number]
    ),
    'when creating a failure with value should set errors on failure': _.check(
        function(a) {
            return _.expect(_.Failure(a).errors).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating failure should be valid attempt': _.check(
        function(a) {
            return _.isAttempt(_.Failure(a));
        },
        [_.AnyVal]
    ),
    'when creating failure should be failure': _.check(
        function(a) {
            return _.Failure(a).isFailure;
        },
        [_.AnyVal]
    ),
    'when creating failure should not be success': _.check(
        function(a) {
            return !_.Failure(a).isSuccess;
        },
        [_.AnyVal]
    ),
    'when creating failure and mapping value should not call map': _.check(
        function(a) {
            return _.expect(_.Failure(a).map(
                _.error('Failed if called')
            ).errors).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating failure and folding should map to correct value': _.check(
        function(a) {
            return _.expect(_.Failure(a).fold(
                _.error('Failed if called'),
                _.inc
            )).toBe(a + 1);
        },
        [Number]
    ),
    'when creating success and calling ap with a success should concat to correct value': _.check(
        function(a, b) {
            return _.expect(_.Success(
                _.constant(a)
            ).ap(
                _.Success(b),
                _.concat
            ).value).toBe(a);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating success and calling ap with a failure should concat to correct value': _.check(
        function(a, b) {
            return _.expect(_.Success(
                _.constant(a)
            ).ap(
                _.Failure(b),
                _.concat
            ).errors).toBe(b);
        },
        [_.AnyVal, _.arrayOf(_.AnyVal)]
    ),
    'when creating failure and calling ap with a success should concat to correct value': _.check(
        function(a, b) {
            return _.expect(_.Failure(a).ap(
                _.Success(b),
                _.concat
            ).errors).toBe(a);
        },
        [_.arrayOf(_.AnyVal), _.AnyVal]
    ),
    'when creating failure and calling ap with a failure should concat to correct value': _.check(
        function(a, b) {
            var errors = _.Failure(a).ap(
                _.Failure(b),
                _.concat
            ).errors;
            return _.expect(errors).toBe(a.concat(b));
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when creating success and calling chain with function should be correct value': _.check(
        function(a) {
            return _.expect(_.Success(a).chain(_.identity)).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating failure and calling chain with function should be correct value': _.check(
        function(a) {
            return _.expect(_.Failure(a).chain(_.constant(false))).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating success and checking equality should be true': _.check(
        function(a) {
            return a.equal(a);
        },
        [_.successOf(_.AnyVal)]
    ),
    'when creating failure and checking equality should be true': _.check(
        function(a) {
            return a.equal(a);
        },
        [_.failureOf(_.AnyVal)]
    ),
    'when creating failure with success and checking equality should be false': _.check(
        function(a, b) {
            return !a.equal(b);
        },
        [_.successOf(_.AnyVal), _.failureOf(_.AnyVal)]
    ),
    'when creating success and extracting value should be correct value': _.check(
        function(a) {
            return _.expect(_.Success(a).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating failure and extracting value should be correct value': _.check(
        function(a) {
            return _.expect(_.Failure(a).extract()).toBe(a);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when creating success and swapping value should be true': _.check(
        function(a) {
            return a.swap().isFailure;
        },
        [_.successOf(_.AnyVal)]
    ),
    'when creating success and swapping value should be correct value': _.check(
        function(a) {
            return _.expect(_.Success(a).swap().extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating failure and swapping value should be true': _.check(
        function(a) {
            return a.swap().isSuccess;
        },
        [_.failureOf(_.AnyVal)]
    ),
    'when creating failure and swapping value should be correct value': _.check(
        function(a) {
            return _.expect(_.Failure(a).swap().extract()).toBe(a);
        },
        [_.AnyVal]
    )
};
