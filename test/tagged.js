var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });

exports.tagged = {
    'when creating a tagged type, should return correct first value': _.check(
        function(a, b) {
            return _.equal(_.tagged('T', ['a', 'b'])(a, b).a, a);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a tagged type, should return correct second value': _.check(
        function(a, b) {
            return _.equal(_.tagged('T', ['a', 'b'])(a, b).a, a);
        },
        [_.AnyVal, _.AnyVal]
    )
};
