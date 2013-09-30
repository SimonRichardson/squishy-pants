var _ = require('./lib/test'),
    id = _.Parser.regexp(/^[a-zA-Z_]+/),
    alpha = _.Parser.regexp(/^[a-zA-Z]+/),
    number = _.Parser.regexp(/^[\+\-]?\d+(\.\d+)?/),
    whitespace = _.Parser.regexp(/^\s+/),
    optionalWhitespace = _.Parser.regexp(/^\s*/),
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

            return _.expect(parser.parse(value)).toBe(_.Success(['(', expected, ')']));
        },
        [Number]
    ),
    'when testing a number with whitespace in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                parser = leftBracket.skip(whitespace).chain(function() {
                    return round.skip(whitespace).chain(function() {
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
                parser = leftBracket.skip(whitespace).chain(function() {
                    return round.skip(whitespace).chain(function() {
                        return rightBracket;
                    });
                }),
                value = '(' + a + ')';

            return _.expect(parser.parse(value)).toBe(_.Failure([[a + ')', 1], [a, 1]]));
        },
        [_.NonEmptyAlphaChar]
    ),
    'when testing a number or alpha character or leftBracket should return correct value': _.check(
        function(a) {
            var parser = leftBracket.orElse(alpha).orElse(number);

            return _.expect(parser.parse(a)).toBe(_.Success([a]));
        },
        [_.NumericOrAlphaChar]
    ),
    'when testing a number or alpha character in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                parser = leftBracket.skip(whitespace).chain(function() {
                    return round.orElse(alpha).skip(whitespace).chain(function() {
                        return rightBracket;
                    });
                }),
                value = '(' + a + ')',
                possibleNumber = parseFloat(a, 10),
                expected = _.isNaN(possibleNumber) ? a : toFloat(toInt(possibleNumber)).toString();

            return _.expect(parser.parse(value)).toBe(_.Success(['(', expected, ')']));
        },
        [_.NumericOrAlphaChar]
    ),
    'when testing nested values in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt),
                atom = round.orElse(id),
                form = leftBracket.skip(optionalWhitespace).chain(function() {
                    return atom.skip(optionalWhitespace).many().skip(rightBracket);
                }),
                expr = form.orElse(atom),
                value = '(add 1 2)';

            return _.expect(expr.parse(value)).toBe(_.Success(['(', 'add', 1])); //, '2', ')']));
        },
        [_.NumericOrAlphaChar]
    )
};
