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
    )
};

exports.readerT = {
    'when testing readerT ap should return correct value': _.check(
        function(a, b) {
            var monad = _.Reader.of(a),
                transformer = _.Reader.ReaderT(monad),
                actual = transformer(_.Reader.of(_.inc)).ap(transformer(monad)),
                expected = transformer(_.Reader.of(a + 1));

            return _.expect(actual.run.run(b)).toBe(expected.run.run(b));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing readerT map should return correct value': _.check(
        function(a, b) {
            var readerT = _.Reader.ReaderT(_.Reader.of(a)),
                actual = readerT(_.Reader.of(a)).map(_.inc),
                expected = readerT(_.Reader.of(a + 1));

            return _.expect(actual.run.run(b)).toBe(expected.run.run(b));
        },
        [Number, Number]
    ),
    'when testing readerT chain should return correct value': _.check(
        function(a, b, c) {
            var readerT0 = _.Reader.ReaderT(_.Reader.of(a)),
                readerT1 = _.Reader.ReaderT(_.Reader.of(b)),
                actual = readerT0(_.Reader.of(a)).chain(
                    function() {
                        return readerT1(_.Reader.of(b));
                    }
                ),
                expected = readerT0(_.Reader.of(b));

            return _.expect(actual.run.run(c)).toBe(expected.run.run(c));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when creating a readerT and using chain should be correct value': _.check(
        function(a, b, c) {
            var monad = _.Reader.of(1),
                transformer = _.Reader.ReaderT(monad),
                actual = transformer(_.Reader.of(b)).chain(function(x) {
                    return _.Reader.ReaderT(monad).of(x + 1);
                }),
                expected = _.Reader.ReaderT(monad).of(b + 1);

            return _.expect(actual.run.run(c)).toBe(expected.run.run(c));
        },
        [Number, Number, Number]
    ),
    'when creating a readerT using readerTOf and chain should be correct value': _.check(
        function(a, b, c) {
            var actual = a(_.Reader.of(b)).chain(function(x) {
                    return _.Reader.ReaderT(_.Reader.of(1)).of(x + 1);
                }),
                expected = _.Reader.ReaderT(_.Reader.of(1)).of(b + 1);

            return _.expect(actual.run.run(c)).toBe(expected.run.run(c));
        },
        [_.readerTOf(Number), Number, Number]
    ),
    'when creating a readerT using readerTOf and map should be correct value': _.check(
        function(a, b, c) {
            var actual = _.map(
                    a(_.Reader.of(b)),
                    function(x) {
                        return x + 1;
                    }
                ),
                expected = _.Reader.ReaderT(_.Reader.of(1)).of(b + 1);

            return _.expect(actual.run.run(c)).toBe(expected.run.run(c));
        },
        [_.readerTOf(Number), Number, Number]
    )
};