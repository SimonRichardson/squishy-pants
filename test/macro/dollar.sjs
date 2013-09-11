exports.list_macro = {
    'when creating $ dollar with functions should return correct result': _.check(
        function(a, b) {
            var result = (_.Identity $ _.Identity $ a + b)

            return _.expect(result).toBe(_.Identity(_.Identity(a + b)));
        },
        [Number, Number]
    ),
    'when creating $ dollar with numbers should return correct result': _.check(
        function(a, b, c, d, e) {
            var result = (a + $ b * c + $ d / e)

            return _.expect(result).toBe(a + (b * (c + (d / e))));
        },
        [Number, Number, Number, Number, Number]
    )
};