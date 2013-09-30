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

// Append to squishy
_ = _
  .property('xcheck', function() {});

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

            return _.expect(parser.parse(value)).toBe(_.Success(['(', expected, ')']));
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

            return _.expect(parser.parse(value)).toBe(_.Success(['(', expected, ')']));
        },
        [Number]
    ),
    'when testing a alpha character in brackets should return attempt failure': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                parser = leftBracket.skip(whitespace).chain(function(a, b, c, d) {
                    return round.skip(whitespace).chain(function(a, b, c, d) {
                        return rightBracket;
                    });
                }),
                value = '(' + a + ')';

            return _.expect(parser.parse(value)).toBe(_.Failure([[a + ')', 1]]));
        },
        [_.NonEmptyAlphaChar]
    )
};
