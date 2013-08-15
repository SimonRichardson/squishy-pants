var _ = require('./lib/test');

exports.array = {
    'when testing concat with array should yield merged array': _.check(
        function(a, b) {
            return _.equal(_.concat(a, b), a.concat(b));
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing count with array should be correct value': _.check(
        function(a) {
            var accum = 0,
                i;

            for(i = 0; i < a.length; i++) {
                if (_.isEven(a[i])) accum = _.inc(accum);
            }

            return _.equal(_.count(a, _.isEven), accum);
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing drop with array should be correct value': _.check(
        function(a) {
            var x = Math.floor(_.randomRange(0, a.length));
            return _.equal(_.drop(a, x), a.slice(x));
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing dropRight with array should be correct value': _.check(
        function(a, b) {
            var x = _.randomRange(1, a.length - 1);
            return _.equal(_.dropRight(a, x), a.slice(0, -x));
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing dropWhile with array should be correct value': _.check(
        function(a, b) {
            function dropWhile(a, f) {
                var rec = function rec(index) {
                    if (index >= a.length) return a.slice();

                    if (f(a[index])) return rec(++index);
                    else return a.slice(index);
                };
                return rec(0);
            }
            return _.equal(_.dropWhile(a, _.isEven), dropWhile(a, _.isEven));
        },
        [_.arrayOf(_.Integer)]
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

            return _.equal(_.filter(a, _.isEven), accum);
        },
        [_.arrayOf(Number)]
    ),
    'when testing flatMap with array should yield items': _.check(
        function(a) {
            var accum = [],
                i;

            for(i = 0; i < a.length; i++) {
                accum = accum.concat(a[i]);
            }

            return _.equal(_.flatMap(a, _.identity), accum);
        },
        [_.arrayOf(_.arrayOf(_.AnyVal))]
    ),
    'when testing fold with array should yield items': _.check(
        function(a) {
            var accum = 0,
                sum = function(a, b) {
                    return a + b;
                },
                i;

            for(i = 0; i < a.length; i++) {
                accum = sum(accum, a[i]);
            }

            return _.equal(_.fold(a, 0, sum), accum);
        },
        [_.arrayOf(Number)]
    ),
    'when testing foldRight with array should yield items': _.check(
        function(a) {
            var accum = 0,
                minus = function(a, b) {
                    return a - b;
                },
                i;

            for (i = a.length - 1; i >= 0; --i) {
                accum = minus(accum, a[i]);
            }

            return _.equal(_.foldRight(a, 0, minus), accum);
        },
        [_.arrayOf(Number)]
    )
};