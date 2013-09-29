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

        var number = parser.map(toInt).map(toFloat);
        var result = number.orElse(char).parse('1.1');

        console.log(result);

        test.ok(true);
        test.done();
    }
};
