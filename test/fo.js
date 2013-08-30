var _ = require('./lib/test');

// Prevent the changing of Function.prototype
var func = _.tagged('func', ['value']);
_.fo.unsafeSetValueOf(func.prototype);

exports.fo = {
    'when testing fo with `>=` chaining values and getting correct value': _.check(
        function(a) {
            return _.expect(
                    _.fo()(
                        _.Identity(a) >= func(function(x) {
                            return _.Identity(x + 1);
                        })
                    )
                ).toBe(_.Identity(a + 1));
        },
        [_.Integer]
    )
};