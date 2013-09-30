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

        var float = _.Parser.regexp(/^[\+\-]?[0-9\\.]+/);
        var char = _.Parser.regexp(/^[a-z]/);
        var openBracket = _.Parser.string('(');
        var closeBracket = _.Parser.string(')');
        var one = _.Parser.string('1');

        var floatRound = float.map(toInt).map(toFloat);

        var result = openBracket.skip(whitespace).chain(function(a, b, c, d) {
            return floatRound.skip(whitespace).chain(function(a, b, c, d) {
                return closeBracket;
            });
        });

        test.ok(_.expect(result.parse('( 1 )')).toBe(_.Attempt.of(['(', '1.00', ')'])));
        test.done();
    }
};
