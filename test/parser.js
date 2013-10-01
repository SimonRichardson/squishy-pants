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

            return _.expect(parser.parse(value)).toBe(_.Failure([[a + ')', 1]]));
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
    'when testing a alpha character or leftBracket or rightBracket but got number should return failure': _.check(
        function(a) {
            var parser = rightBracket.orElse(leftBracket).orElse(alpha),
                value = a.toString();

            return _.expect(parser.parse(value)).toBe(_.Failure([[value, 0]]));
        },
        [Number]
    ),
    'when testing two numbers brackets in should return correct value': _.check(
        function(a, b) {
            var parser = leftBracket.chain(function() {
                    return number.skip(whitespace).chain(function() {
                          return number.chain(function() {
                              return rightBracket;
                          });
                    });
                }),
                value = '(' + a + ' ' + b + ')',
                expected = ['(', a.toString(), b.toString(), ')'];

            return _.expect(parser.parse(value)).toBe(_.Success(expected));
        },
        [Number, Number]
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
    'when testing nested values in brackets or atom should return atom': _.check(
        function(a) {
            var round = number.map(toInt),
                atom = round.orElse(id),
                form = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().skip(rightBracket);
                }),
                expr = form.orElse(atom).skip(optionalWhitespace),
                value = a.toString();

            return _.expect(expr.parse(value)).toBe(_.Success([toInt(value)]));
        },
        [Number]
    ),
    'when testing two numbers in brackets should return correct value': _.check(
        function(a, b) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().chain(function() {
                        return rightBracket;
                    });
                }),
                expr = block.orElse(number).skip(optionalWhitespace),
                value = '(' + a + ' ' + b + ')',
                expected = ['(', a.toString(), b.toString(), ')'];

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number, Number]
    ),
    'when testing three numbers in brackets should return correct value': _.check(
        function(a, b, c) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().chain(function() {
                        return rightBracket;
                    });
                }),
                expr = block.orElse(number).skip(optionalWhitespace),
                value = '(' + a + ' ' + b + ' ' +c + ')',
                expected = ['(', a.toString(), b.toString(), c.toString(), ')'];

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number, Number, Number]
    ),
    'when testing one string and two numbers in brackets should return correct value': _.check(
        function(a, b, c) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().chain(function() {
                        return rightBracket;
                    });
                }),
                atom = number.orElse(id),
                expr = block.orElse(atom).skip(optionalWhitespace),
                value = '(' + a + ' ' + b + ' ' +c + ')',
                expected = ['(', a, b.toString(), c.toString(), ')'];

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [_.NonEmptyAlphaChar, Number, Number]
    ),
    'when testing `(add 1 2)` should return correct value': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().chain(function() {
                    return rightBracket;
                });
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add 1 2)',
            expected = ['(', 'add', '1', '2', ')'];

        test.ok(_.expect(expr.parse(value)).toBe(_.Success(expected)));
        test.done();
    },
    'when testing `(add (mul 1 2) 3)` should return correct value': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().chain(function() {
                    return rightBracket;
                });
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add (mul 1 2) 3)',
            expected = ['(', 'add', '(', 'mul', '1', '2', ')', '3', ')'];

        test.ok(_.expect(expr.parse(value)).toBe(_.Success(expected)));
        test.done();
    }
};
