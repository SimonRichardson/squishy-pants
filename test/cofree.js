var _ = require('./lib/test'),
    fromArray = function(a) {
        var result = _.None,
            index = a.length;

        while(--index > -1) {
            result = _.Some(_.Cofree(a[index], result));
        }

        return result;
    },
    toArray = function(xs) {
        return [xs.a].concat(xs.h.match({
            Some: function(x) {
                return toArray(x);
            },
            None: function() {
                return [];
            }
        }));
    };

exports.cofree = {
    'when testing map should return correct value': _.check(
        function(a) {
            if (a.length < 1) return true;

            var x = fromArray(a).get(),
                actual = x.map(_.inc),
                expected = _.map(a, _.inc);

            return _.expect(actual.toArray()).toBe(expected);
        },
        [_.arrayOf(Number)]
    ),
    'when testing extract should return correct value': _.check(
        function(a) {
            return _.expect(a.extract()).toBe(a.a);
        },
        [_.cofreeOf(Number)]
    ),
    'when testing extend should return correct value': _.check(
        function(a) {
            var actual = a.extend(
                    function(a) {
                        return a.toArray();
                    }
                ),
                b = a.toArray(),
                expected = _.map(_.zipWithIndex(b), function(t){
                    return b.slice(t._2);
                });

            return _.expect(actual.toArray()).toBe(expected);
        },
        [_.cofreeOf(Number)]
    ),
    'when testing traverse should return correct value': _.check(
        function(a) {
            var actual = a.traverse(_.Option.of, _.Option);
            return _.expect(actual.map(toArray)).toBe(_.Some(a.toArray()));
        },
        [_.cofreeOf(Number)]
    ),
    'when testing toArray should return correct value': _.check(
        function(a) {
            if (a.length < 1) return true;

            var x = fromArray(a).get();
            return _.expect(x.toArray()).toBe(a);
        },
        [_.arrayOf(Number)]
    ),
    'when testing toList should return correct value': _.check(
        function(a) {
            if (a.size() < 1) return true;

            var x = _.Cofree.fromList(a).get();
            return _.expect(x.toList()).toBe(a);
        },
        [_.listOf(Number)]
    ),
    'when testing shrink should return correct value': _.check(
        function(a) {
            return _.expect(_.shrink(a)).toBe([]);
        },
        [_.cofreeOf(Number)]
    )
};