var _ = require('./lib/test');

var count = _.curry(function(x, n) {
    if(n >= x) return _.done(n);
    return _.cont(function() {
        return count(x, n + 1);
    });
});

exports.curriedTest = function(test) {
    var n = 10000;
    test.equal(_.trampoline(count(n, 0)), n);
    test.done();
};
