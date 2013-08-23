var _ = require('./lib/test');

exports.reader = {
    'when constructing a Reader the string value length should be returned': _.check(
        function(a) {
            return _.equal(a.length, _.Reader(function(b) {
                return b.length;
            }).run(a));
        },
        [String]
    ),
    'when testing the Reader of with any value should return passed value': _.check(
        function(a, b) {
            return _.equal(a, _.Reader.of(a).run(b));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing ap on the Reader should return the new value': _.check(
        function(a) {
            var reader = _.Reader.of(_.concat(1));
            return _.expect(reader.ap(_.Reader.of(a)).run()).toBe(a + 1);
        },
        [Number]
    ),
    'when testing flatMap on the Reader should return the new value': _.check(
        function(a, b) {
            return _.equal(a.length + b, _.Reader.ask.flatMap(function(s) {
                return _.Reader.of(s.length + b);
            }).run(a));
        },
        [String, Number]
    ),
    'when testing map on the Reader should return the new value': _.check(
        function(a) {
            return _.expect(_.Reader.ask.map(function(a) {
                return a + 1;
            }).run(a)).toBe(a + 1);
        },
        [Number]
    )
};
