var _ = require('./lib/test'),
    number = _.Parser.regexp(/^[\+\-]?\d+(\.\d+)?/),
    whitespace = _.Parser.regexp(/^\s+/),
    leftBracket = _.Parser.string('('),
    rightBracket = _.Parser.string(')');

function toInt(a) {
    return ~~a;
}

function toFloat(a) {
    return a.toFixed(2);
}

exports.parser = {
    'when testing a number in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                parser = leftBracket.skip(whitespace).chain(function(a, b, c, d) {
                    return round.skip(whitespace).chain(function(a, b, c, d) {
                        return rightBracket;
                    });
                }),
                value = '(' + a + ')',
                expected = toFloat(toInt(a)).toString();

            return _.expect(parser.parse(value)).toBe(_.Attempt.of(['(', expected, ')']));
        },
        [Number]
    ),
    'when testing a number with whitespace in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                parser = leftBracket.skip(whitespace).chain(function(a, b, c, d) {
                    return round.skip(whitespace).chain(function(a, b, c, d) {
                        return rightBracket;
                    });
                }),
                value = '( ' + a + ' )',
                expected = toFloat(toInt(a)).toString();

            return _.expect(parser.parse(value)).toBe(_.Attempt.of(['(', expected, ')']));
        },
        [Number]
    )
};
