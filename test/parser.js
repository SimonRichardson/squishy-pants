var _ = require('./lib/test');

function toInt(a) {
    return ~~a;
}

exports.parser = {
    'test': function(test) {

        var parser = _.Parser.regexp(/^[0-9\\.]+/);
        var result = parser.map(toInt).run('1.1');

        console.log(result);

        test.ok(true);
        test.done();
    }
};
