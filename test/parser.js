var _ = require('./lib/test'),
    id = _.Parser.regexp(/^[a-zA-Z_]+/),
    alpha = _.Parser.regexp(/^[a-zA-Z]+/),
    number = _.Parser.regexp(/^[\+\-]?\d+(\.\d+)?/),
    whitespace = _.Parser.regexp(/^\s+/),
    optionalWhitespace = _.Parser.regexp(/^\s*/),
    leftBracket = _.Parser.string('('),
    rightBracket = _.Parser.string(')');

function toInt(a) {
    return parseInt(a, 10);
}

function toFloat(a) {
    return a.toFixed(2);
}

function statementToArray(str) {
    var rec = function(str) {
        var index = str.indexOf('('),
            name = '',
            arg0,
            arg1,
            spaceIndex,
            rightIndex;

        if (index === 0) {
            nameIndex = str.indexOf(' ');
            name = str.slice(1, nameIndex);

            arg0 = rec(str.slice(nameIndex + 1));
            arg1 = rec(arg0[0]);

            return [arg1[0].slice(1), [name, arg0[1], arg1[1]]];
        } else {
            spaceIndex = str.indexOf(' ');
            rightIndex = str.indexOf(')');

            if (spaceIndex >= 0 && spaceIndex < rightIndex) {
                return [str.slice(spaceIndex + 1), str.slice(0, spaceIndex)];
            } else {
                return [str.slice(rightIndex + 1), str.slice(0, rightIndex)];
            }
        }
    };

    return rec(str)[1];
}

function invalidStatementToArray(str) {
    var index = str.indexOf('/');
    if (index < 0) {
        return _.Success([statementToArray(str)]);
    }
    return _.Failure([['/', index]]);
}

exports.parser = {
   'when testing a number in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                expr = leftBracket.skip(optionalWhitespace).chain(function(a, b, c, d) {
                    return round.skip(optionalWhitespace).skip(rightBracket);
                }),
                value = '(' + a + ')',
                expected = toFloat(toInt(a)).toString();

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number]
    ),
    'when testing a number with whitespace in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                expr = leftBracket.skip(whitespace).chain(function() {
                    return round.skip(whitespace).skip(rightBracket);
                }),
                value = '( ' + a + ' )',
                expected = toFloat(toInt(a)).toString();

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number]
    ),
    'when testing a alpha character in brackets should return attempt failure': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                expr = leftBracket.skip(whitespace).chain(function() {
                    return round.skip(whitespace).skip(rightBracket);
                }),
                value = '(' + a + ')';

            return _.expect(expr.parse(value)).toBe(_.Failure([[a + ')', 1]]));
        },
        [_.NonEmptyAlphaChar]
    ),
    'when testing a number or alpha character or leftBracket should return correct value': _.check(
        function(a) {
            var expr = leftBracket.orElse(alpha).orElse(number);

            return _.expect(expr.parse(a)).toBe(_.Success([a]));
        },
        [_.NumericOrAlphaChar]
    ),
    'when testing a alpha character or leftBracket or rightBracket but got number should return failure': _.check(
        function(a) {
            var expr = alpha.orElse(rightBracket).orElse(leftBracket),
                value = a.toString(),
                expected = [[value, 0]];

            return _.expect(expr.parse(value)).toBe(_.Failure(expected));
        },
        [Number]
    ),
    'when testing two numbers brackets in should return correct value': _.check(
        function(a, b) {
            var expr = leftBracket.chain(function() {
                    return number.skip(whitespace).chain(function() {
                          return number.skip(rightBracket);
                    });
                }),
                value = '(' + a + ' ' + b + ')',
                expected = [b.toString()];

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number, Number]
    ),
    'when testing a number or alpha character in brackets should return correct value': _.check(
        function(a) {
            var round = number.map(toInt).map(toFloat),
                expr = leftBracket.skip(optionalWhitespace).chain(function() {
                    return round.orElse(alpha).skip(rightBracket);
                }),
                value = '(' + a + ')',
                possibleNumber = parseFloat(a, 10),
                expected = _.isNaN(possibleNumber) ? [a] : toFloat(toInt(possibleNumber)).toString();

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
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

            return _.expect(expr.parse(value)).toBe(_.Success(toInt(value)));
        },
        [Number]
    ),
    'when testing two numbers in brackets should return correct value': _.check(
        function(a, b) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().skip(rightBracket);
                }),
                expr = block.orElse(number).skip(optionalWhitespace),
                value = '(' + a + ' ' + b + ')',
                expected = [[a.toString(), b.toString()]];

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number, Number]
    ),
    'when testing three numbers in brackets should return correct value': _.check(
        function(a, b, c) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().skip(rightBracket);
                }),
                expr = block.orElse(number).skip(optionalWhitespace),
                value = '(' + a + ' ' + b + ' ' +c + ')',
                expected = [[a.toString(), b.toString(), c.toString()]];

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number, Number, Number]
    ),
    'when testing one string and two numbers in brackets should return correct value': _.check(
        function(a, b, c) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().skip(rightBracket);
                }),
                atom = number.orElse(id),
                expr = block.orElse(atom).skip(optionalWhitespace),
                value = '(' + a + ' ' + b + ' ' +c + ')',
                expected = [[a, b.toString(), c.toString()]];

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [_.NonEmptyAlphaChar, Number, Number]
    ),
    'when testing a generated string with nested values should return correct value': _.check(
        function(a) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().skip(rightBracket);
                }),
                atom = number.orElse(id),
                expr = block.orElse(atom).skip(optionalWhitespace),
                expected = statementToArray(a);

            return _.expect(expr.parse(a)).toBe(_.Success([expected]));
        },
        [_.Generate]
    ),
    'when testing a generated invalid string with nested values should return correct value': _.check(
        function(a) {
            var block = leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().skip(rightBracket);
                }),
                atom = number.orElse(id),
                expr = block.orElse(atom).skip(optionalWhitespace),
                expected = invalidStatementToArray(a);

            return _.expect(expr.parse(a)).toBe(expected);
        },
        [_.GenerateInvalid]
    ),
    'when testing `( )` with many should return correct value': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            expr = block,
            value = '( )',
            expected = [[]];

        test.ok(_.expect(expr.parse(value)).toBe(_.Success(expected)));
        test.done();
    },
    'when testing `()` with many should return correct value': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            expr = block,
            value = '()',
            expected = [[]];

        test.ok(_.expect(expr.parse(value)).toBe(_.Success(expected)));
        test.done();
    },
    'when testing `(add 1 2)` should return correct value': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add 1 2)',
            expected = [['add', '1', '2']];

        test.ok(_.expect(expr.parse(value)).toBe(_.Success(expected)));
        test.done();
    },
    'when testing `(add (mul 1 2) 3)` should return correct value': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add (mul 1 2) 3)',
            expected = [['add', ['mul', '1', '2'], '3']];

        test.ok(_.expect(expr.parse(value)).toBe(_.Success(expected)));
        test.done();
    },
    'when testing `(add (mul 10 (add 3 4)) (add 7 8))` should return correct value': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add (mul 10 (add 3 4)) (add 7 8))',
            expected = [['add', ['mul', '10', ['add', '3', '4']], ['add', '7', '8']]];

        test.ok(_.expect(expr.parse(value)).toBe(_.Success(expected)));
        test.done();
    },
    'when testing `(add /)` should return failure': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add /)',
            expected = [['/', 5]];

        test.ok(_.expect(expr.parse(value)).toBe(_.Failure(expected)));
        test.done();
    },
    'when testing `(add 2 /)` should return failure': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add 2 /)',
            expected = [['/', 7]];

        test.ok(_.expect(expr.parse(value)).toBe(_.Failure(expected)));
        test.done();
    },
    'when testing `(add 2 (mul / 3))` should return failure': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add 2 (mul / 3))',
            expected = [['/', 12]];

        test.ok(_.expect(expr.parse(value)).toBe(_.Failure(expected)));
        test.done();
    },
    'when testing `(add (mul 10 (add 3 /)) (add 7 8))` should return failure': function(test) {
        var block = leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            }),
            atom = number.orElse(id),
            expr = block.orElse(atom).skip(optionalWhitespace),
            value = '(add (mul 10 (add 3 /)) (add 7 8))',
            expected = [['/', 20]];

        test.ok(_.expect(expr.parse(value)).toBe(_.Failure(expected)));
        test.done();
    },
    'when testing of should return correct value': _.check(
        function(a) {
            return _.expect(_.Parser.of(a).run()).toBe(_.Tuple4(a, 0, _.Attempt.of([]), _.None));
        },
        [_.AnyVal]
    ),
    'when testing empty should return correct value': _.check(
        function(a) {
            return _.expect(_.Parser.empty().run(a)).toBe(_.Tuple4(a, 0, _.Attempt.of([]), _.None));
        },
        [_.AnyVal]
    ),
    'when testing fail should return correct value': _.check(
        function(a, b, c) {
            return _.expect(_.Parser.fail(a).run(b, c)).toBe(_.Tuple4(b, c, _.Attempt.of([a]), _.None));
        },
        [_.AnyVal, Number, Number]
    ),
    'when testing success should return correct value': _.check(
        function(a, b, c) {
            return _.expect(_.Parser.success(a).run(b, c)).toBe(_.Tuple4(b, c, _.Attempt.of(a), _.None));
        },
        [_.AnyVal, Number, Number]
    ),
    'when testing chain should return correct value': _.check(
        function(a) {
            var round = _.map(_.map(number, toInt), toFloat),
                expr = _.chain(leftBracket.skip(optionalWhitespace), function(a, b, c, d) {
                    return round.skip(optionalWhitespace).skip(rightBracket);
                }),
                value = '(' + a + ')',
                expected = toFloat(toInt(a)).toString();

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number]
    ),
    'when testing map should return correct value': _.check(
        function(a) {
            var round = _.map(_.map(number, toInt), toFloat),
                expr = leftBracket.skip(optionalWhitespace).chain(function(a, b, c, d) {
                    return round.skip(optionalWhitespace).skip(rightBracket);
                }),
                value = '(' + a + ')',
                expected = toFloat(toInt(a)).toString();

            return _.expect(expr.parse(value)).toBe(_.Success(expected));
        },
        [Number]
    ),
    'when testing two numbers brackets in should fail in also return correct value': _.check(
        function(a, b) {
            var expr = leftBracket.also(function() {
                    return alpha.orElse(alpha).also(function() {
                          return number.skip(rightBracket);
                    });
                }),
                value = '(' + a + ' ' + b + ')',
                expected = [[a + ' ' + b + ')', 1]];

            return _.expect(expr.parse(value)).toBe(_.Failure(expected));
        },
        [Number, Number]
    )
};
