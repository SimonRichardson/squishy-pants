var _ = require('./lib/test'),
    fromArray = function(a) {
        var result = _.None,
            index = a.length;

        while(--index > -1) {
            result = _.Some(_.Cofree(a[index], result));
        }

        return result;
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
    )
};