var _ = require('./lib/test');

exports.io = {
    'when testing io against perform returns constant value': _.check(
        function(a) {
            return _.io(_.constant(a)).perform() == a;
        },
        [_.AnyVal]
    ),
    'when testing flatMap with constant value should return mapped value': _.check(
        function(a) {
            return _.io(_.constant(a)).flatMap(function(b) {
                return _.io(_.constant(a == b));
            }).perform();
        },
        [_.AnyVal]
    )
};
