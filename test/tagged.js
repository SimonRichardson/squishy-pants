var _ = require('../bin/squishy-pants');

exports.tagged = {
    testTagged: function(test) {
        var A = _.tagged('A', ['a', 'b']);
        var a = A(1, 2);
        test.equal(a.a, 1);
        test.equal(a.b, 2);
        test.expect(2);
        test.done();
    }
};