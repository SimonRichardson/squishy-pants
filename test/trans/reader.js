var _ = require('./../lib/test');

exports.readerT = {
    'when testing ReaderT map should return correct value': _.check(
        function(a, b, c) {
            var x = _.Reader.ReaderT(_.Reader),
                y = x.of(a).map(function(v) {
                    return _.Reader.of(v + 1);
                });

            return _.expect(y.run(c).run(b).run()).toBe(a + 1);
        },
        [_.Integer, _.AnyVal, _.AnyVal]
    ),
    'when testing ReaderT chain should return correct value': _.check(
        function(a, b, c) {
            var x = _.Reader.ReaderT(_.Reader),
                y = x.of(a).chain(function() {
                    return x.of(_.Reader.of(b));
                });

            return _.expect(y.run(c).run(b).run()).toBe(b);
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing ReaderT arb should return correct value': _.check(
        function(a, b) {
            return _.expect(a(b).run).toBe(b);
        },
        [_.readerTOf(_.readerOf(_.AnyVal)), _.AnyVal]
    )
};