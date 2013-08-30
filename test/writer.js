var _ = require('./lib/test');

exports.writer = {
    'when testing writer with multiple maps should return correct value': function(test) {
        var f = function(t) {
                return _.Tuple2(t._1 / 2, 'I just halved ' + t._1 + '!');
            },
            result = _.Writer.put(_.Tuple2(8, '')).map(f).map(f).run();

        test.ok(_.expect(result).toBe(_.Tuple2(2, 'I just halved 8!I just halved 4!')));
        test.done();
    },
    'when creating a writer using of then running should return correct value': _.check(
        function(a) {
            var writer = _.Writer.of(a);
            return _.expect(writer.run()).toBe(_.Tuple2(a, null));
        },
        [_.Integer]
    ),
    'when creating a writer using ap then running should return correct value': _.check(
        function(a, b, c) {
            var writer = _.Writer.put(_.Tuple2(_.concat(a), c)),
                result = writer.ap(_.Writer.put(_.Tuple2(b, ''))).run();

            return _.expect(result).toBe(_.Tuple2(a + b, c));
        },
        [_.Integer, _.Integer, String]
    ),
    'when creating a writer using chain then running should return correct value': _.check(
        function(a, b, c) {
            var writer = _.Writer.put(_.Tuple2(a, b)),
                result = writer.chain(function(t) {
                    return _.Writer.put(_.Tuple2(t._1 + 1, c));
                }).run();

            return _.expect(result).toBe(_.Tuple2(a + 1, b + c));
        },
        [_.Integer, String, String]
    ),
    'when creating a writer using map then running should return correct value': _.check(
        function(a, b) {
            var writer = _.Writer.put(_.Tuple2(a, b)),
                result = writer.map(function(t) {
                    return _.Tuple2(t._1 + 1, '');
                }).run();

            return _.expect(result).toBe(_.Tuple2(a + 1, b));
        },
        [_.Integer, String]
    )
};
