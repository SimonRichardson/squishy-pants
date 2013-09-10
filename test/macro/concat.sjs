exports.concat_macro = {
    'applying concat should return the correct value': _.check(
        function(a, b) {
            var sum = $concat (a + b);

            return _.expect(sum.x).toBe(a.x + b.x);
        },
        [_.identityOf(String), _.identityOf(String)]
    ),
    'applying concat multiple times should return the correct value': _.check(
        function(a, b, c) {
            var sum = $concat (a + b + c);

            return _.expect(sum.x).toBe(a.x + b.x + c.x);
        },
        [_.identityOf(String), _.identityOf(String), _.identityOf(String)]
    )
};