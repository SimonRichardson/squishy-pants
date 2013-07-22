var _ = require('./lib/test');

exports.array = {
    'when testing concat with array should yield merged array': _.check(
        function(a, b) {
            return _.concat(a, b).toString() === a.concat(b).toString();
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing exists with array should yield item': _.check(
        function(a) {
            if (a.length === 0) return true;

            var index = Math.floor(_.randomRange(0, a.length));
            return _.exists(a, function(v) {
                return v === a[index];
            });
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing filter with array should yield items': _.check(
        function(a) {
            var accum = [],
                i;

            for(i = 0; i < a.length; i++) {
                if (_.isEven(a[i])) accum.push(a[i]);
            }

            return _.filter(a, _.isEven).toString() === accum.toString();
        },
        [_.arrayOf(Number)]
    )
};