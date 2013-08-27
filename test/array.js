var _ = require('./lib/test');

exports.array = {
    'when testing ap with array should yield correct value': _.check(
        function(a) {
            var expected = _.fold(
                    _.range(0, a.length),
                    [],
                    function(x) {
                        return x.concat(a);
                    }
                ),
                concat = _.fill(a.length)(_.constant(_.identity));

            return _.expect(_.ap(concat, a)).toBe(expected);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing concat with array should yield merged array': _.check(
        function(a, b) {
            return _.expect(_.concat(a, b)).toBe(a.concat(b));
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

            return _.expect(_.count(a, _.isEven)).toBe(accum);
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing drop with array should be correct value': _.check(
        function(a) {
            var x = Math.floor(_.randomRange(0, a.length));
            return _.expect(_.drop(a, x)).toBe(a.slice(x));
        },
        [_.arrayOf(_.Integer)]
    ),
    'when testing dropRight with array should be correct value': _.check(
        function(a, b) {
            var x = _.randomRange(1, a.length - 1);
            return _.expect(_.dropRight(a, x)).toBe(a.slice(0, -x));
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
            return _.expect(_.dropWhile(a, _.isEven)).toBe(dropWhile(a, _.isEven));
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

            return _.expect(_.filter(a, _.isEven)).toBe(accum);
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

            return _.expect(_.flatMap(a, _.identity)).toBe(accum);
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

            return _.expect(_.fold(a, 0, sum)).toBe(accum);
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

            return _.expect(_.foldRight(a, 0, minus)).toBe(accum);
        },
        [_.arrayOf(Number)]
    ),
    'when testing map with array should yield items': _.check(
        function(a) {
            var accum = [],
                i;

            for(i = 0; i < a.length; i++) {
                accum.push(_.inc(a[i]));
            }

            return _.expect(_.map(a, _.inc)).toBe(accum);
        },
        [_.arrayOf(Number)]
    ),
    'when testing partition with array should yield items': _.check(
        function(a) {
            var left = [],
                right = [],
                i;

            for(i = 0; i < a.length; i++) {
                if (_.isEven(a[i])) left.push(a[i]);
                else right.push(a[i]);
            }

            return _.expect(_.partition(a, _.isEven)).toBe(_.Tuple2(left, right));
        },
        [_.arrayOf(Number)]
    ),
    'when testing reduce with array should yield items': _.check(
        function(a) {
            var accum = a[0] || null,
                sum = function(a, b) {
                    return a + b;
                },
                i;

            for(i = 1; i < a.length; i++) {
                accum = sum(accum, a[i]);
            }

            return _.expect(_.reduce(a, sum)).toBe(accum);
        },
        [_.arrayOf(Number)]
    ),
    'when testing reduceRight with array should yield items': _.check(
        function(a) {
            var accum = a[a.length - 1] || null,
                minus = function(a, b) {
                    return a - b;
                },
                i;

            for (i = a.length - 2; i >= 0; --i) {
                accum = minus(accum, a[i]);
            }

            return _.expect(_.reduceRight(a, minus)).toBe(accum);
        },
        [_.arrayOf(Number)]
    ),
    'when testing take with array should yield items': _.check(
        function(a) {
            var rnd = Math.floor(_.randomRange(0, a.length));
            return _.expect(_.take(a, rnd)).toBe(a.slice(0, rnd));
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing takeRight with array should yield items': _.check(
        function(a) {
            var rnd = Math.floor(_.randomRange(0, a.length));
            return _.expect(_.takeRight(a, rnd)).toBe(a.slice(-rnd));
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing takeWhile with array should yield items': _.check(
        function(a) {
            var accum = [],
                i;

            for(i = 0; i < a.length; i++) {
                if (!_.isEven(a[i])) {
                    accum = a.slice(0, i);
                    break;
                }
            }

            return _.expect(_.takeWhile(a, _.isEven)).toBe(accum);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when testing zip with array should yield items': _.check(
        function(a, b) {
            var accum = [],
                i;

            for(i = 0; i < Math.min(a.length, b.length); i++) {
                accum.push(_.Tuple2(a[i], b[i]));
            }

            return _.expect(_.zip(a, b)).toBe(accum);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    ),
    'when testing zipWithIndex with array should yield items': _.check(
        function(a, b) {
            var accum = [],
                i;

            for(i = 0; i < a.length; i++) {
                accum.push(_.Tuple2(a[i], i));
            }

            return _.expect(_.zipWithIndex(a)).toBe(accum);
        },
        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]
    )
};