exports.lens_macro = {
    'when creating lens with string should return correct result': _.check(
        function(a) {
            return _.equal($lens('c.z.i').run(a).get(), a.c.z.i);
        },
        [
            _.objectLike({
                a: String,
                b: Number,
                c: _.objectLike({
                    x: String,
                    y: Array,
                    z: _.objectLike({
                        i: Number,
                        j: Boolean
                    })
                })
            })
        ]
    ),
    'when creating lens with array access with string should return correct result': _.check(
        function(a) {
            if (a.c.z.i.length < 1) return true;
            return _.equal($lens('c.z.i[0].e').run(a).get(), a.c.z.i[0].e);
        },
        [
            _.objectLike({
                a: String,
                b: Number,
                c: _.objectLike({
                    x: String,
                    y: Array,
                    z: _.objectLike({
                        i: _.arrayOf(
                            _.objectLike({
                                e: Number,
                                f: Boolean
                            })
                        ),
                        j: Boolean
                    })
                })
            })
        ]
    )
};