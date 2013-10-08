var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });

exports.matcher = {
    'testing': function(test) {
        var options = {
                'Cons(a, _)': function(a, b, c) {
                    return a;
                },
                '_': function() {
                    return 0;
                }
            },
            args = [1, List.Cons(2, List.Nil)];

        //test.ok(_.matcher(options, 'Cons', args) === 2);
        test.done();
    }
};
