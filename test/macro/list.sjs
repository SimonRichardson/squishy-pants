exports.list_macro = {
    'when creating list with + should return correct result': _.check(
        function(a, b, c) {
            var result = $list (a + b + c);

            return _.expect(result).toBe(squishy.Nil.append(a).append(b).append(c));
        },
        [Number, Number, Number]
    ),
    'when creating list with - should return correct result': _.check(
        function(a, b, c) {
            var result = $list (a - b - c);

            return _.expect(result).toBe(squishy.Nil.prepend(a).prepend(b).prepend(c));
        },
        [Number, Number, Number]
    )
};