var _ = require('./lib/test'),
    List = _.taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });

exports.matcher = {
    'testing': function(test) {
        var dispatcher = {
            'Cons(_, Cons(_, _))': function(head, tail) {
                return 2;
            },
            'Cons(_, Nil)': function(head) {
                return 1;
            },
            Nil: function() {
                return 0;
            }
        };
        console.log('(FIN) --->', _.matcher(dispatcher, 'Cons', ['blah', 1]));
        test.ok(true);
        test.done();
    }
};
