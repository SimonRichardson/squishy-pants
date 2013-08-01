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
    testGadt: _.check(
        function(a) {
            var value = _.Some(_.Right(_.Some(a))),
                result = value.match({
                    Some: {
                        Right: {
                            Some: _.identity,
                            None: _.constant(-1)
                        },
                        Left: _.constant(-1)
                    },
                    None: _.constant(-1)
                });

            return _.equal(result, a);
        },
        [_.AnyVal]
    )
};
