var _ = require('./../lib/test');

exports.readerT = {
    /*'when testing ReaderT map should return correct value': _.check(
        function(a, b) {
            var transformer = _.Reader.ReaderT(_.Reader),
                actual = transformer(_.Reader.of(a)).map(_.inc),
                expected = transformer(_.Reader.of(a + 1));

            return _.expect(actual.run.run(b)).toBe(expected.run.run(b));
        },
        [Number, Number]
    ),*/
    'when testing ReaderT chain should return correct value': _.check(
        function(a, b, c) {
            var x = _.Reader.ReaderT(_.Reader),
                y = x.of(a).chain(function() {
                    return x.of(_.Reader.of(b));
                });

            return _.expect(y.run(c).run(b).run()).toBe(b);
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    )/*,
    'when creating a ReaderT and using chain should be correct value': _.check(
        function(a, b, c) {
            var transformer = _.Reader.ReaderT(_.Reader),
                actual = transformer(_.Reader.of(b)).chain(function(x) {
                    return transformer.of(x + 1);
                }),
                expected = transformer.of(b + 1);

            return _.expect(actual.run.run(c)).toBe(expected.run.run(c));
        },
        [Number, Number, Number]
    ),
    'when creating a ReaderT using readerTOf and chain should be correct value': _.check(
        function(a, b, c) {
            var transformer = _.Reader.ReaderT(_.Reader),
                actual = a(_.Reader.of(b)).chain(function(x) {
                    return transformer.of(x + 1);
                }),
                expected = transformer.of(b + 1);

            return _.expect(actual.run.run(c)).toBe(expected.run.run(c));
        },
        [_.readerTOf(Number), Number, Number]
    ),
    'when creating a ReaderT using readerTOf and map should be correct value': _.check(
        function(a, b, c) {
            var transformer = _.Reader.ReaderT(_.Reader),
                actual = _.map(
                    a(_.Reader.of(b)),
                    function(x) {
                        return x + 1;
                    }
                ),
                expected = transformer.of(b + 1);

            return _.expect(actual.run.run(c)).toBe(expected.run.run(c));
        },
        [_.readerTOf(Number), Number, Number]
    )*/
};