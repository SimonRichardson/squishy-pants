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

        var number = parser.map(toInt).map(toFloat);
        var result = number.parse('1.11');

        console.log(result);

        test.ok(true);
        test.done();
    }
};
