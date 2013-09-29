var _ = require('./lib/test');

function toInt(a) {
    return ~~a;
}

function toFloat(a) {
    return a.toFixed(2);
}

exports.parser = {
    'test': function(test) {

        var whitespace = _.Parser.regexp(/^\s+/);
        var semiColon = _.Parser.regexp(/^;/);

        var parser = _.Parser.regexp(/^-?[0-9\\.]+/);
        var char = _.Parser.regexp(/^[a-z]/);
        var openBracket = _.Parser.string('(');

        var number = parser.map(toInt).map(toFloat);
        var result = openBracket.skip(whitespace).chain(function(a, b, c) {
            return number.orElse(char).skip(whitespace);
        });

        test.ok(_.expect(result.parse('( 1 ')).toBe(_.Attempt.of(['(', '1.00'])));
        test.done();
    }
};
