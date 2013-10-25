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
    'when testing chain on the Reader should return the new value': _.check(
        function(a, b) {
            return _.equal(a.length + b, _.Reader.ask.chain(function(s) {
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
    ),
    'when creating a reader and using lens should be correct value': _.check(
        function(a, b, c) {
            var run = function() {
                    return c;
                },
                reader = _.Reader.lens().run(a).set(run);

            return _.expect(reader.run(b)).toBe(c);
        },
        [_.readerOf(_.AnyVal), _.AnyVal, _.AnyVal]
    ),
    'when creating a reader and using lens get should be correct value': _.check(
        function(a, b) {
            var reader = _.Reader.lens().run(a).get();
            return _.expect(reader.run(b)).toBe(a.run());
        },
        [_.readerOf(_.AnyVal), _.AnyVal]
    ),
    'when using of should be correct value': _.check(
        function(a) {
            return _.expect(_.of(_.Reader, a).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using empty should be correct value': _.check(
        function(a) {
            return _.expect(_.empty(_.Reader).extract()).toBe(null);
        },
        [_.AnyVal]
    ),
    'when using ap should be correct value': _.check(
        function(a) {
            var reader = _.Reader.of(_.concat(1)),
                actual = _.ap(reader, _.Reader.of(a)),
                expected = reader.ap(_.Reader.of(a));
            return _.expect(actual.extract()).toBe(expected.extract());
        },
        [_.AnyVal]
    ),
    'when using chain should be correct value': _.check(
        function(a) {
            return _.expect(_.chain(_.Reader.of(a), function(x) {
                return _.Reader.of(x);
            }).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using extract should be correct value': _.check(
        function(a) {
            return _.expect(_.extract(_.Reader.of(a))).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using shrink should be correct value': _.check(
        function(a) {
            return _.expect(_.shrink(_.Reader.of(a))).toBe([]);
        },
        [_.AnyVal]
    )
};
