var _ = require('./lib/test');

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

exports.gadt = {
    testGadt: function(test) {
        var Either = _.taggedSum('Either', {
                Left: ['value'],
                Right: ['value']
            }),
            Option = _.taggedSum('Option', {
                Some: ['value'],
                None: []
            }),
            value = Option.Some(Either.Left(1)),
            result = value.match({
                Some: {
                    Right: _.identity,
                    Left: _.constant(-1)
                },
                None: _.constant(-1)
            });

        console.log(result);

        test.ok(true);
        test.done();
    }
};
