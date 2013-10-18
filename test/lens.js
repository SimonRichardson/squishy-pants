var _ = require('./lib/test'),
    copy = function(o) {
        var out,
            total,
            i;

        if (_.isArray(o)) {
            out = [];
            for (i = 0, total = o.length; i < total; i++) {
                out[i] = copy(o[i]);
            }
            return out;
        }

        if (_.isObject(o)) {
            out = {};
            for (i in o) {
                out[i] = copy(o[i]);
            }
            return out;
        }

        return o;
    };

exports.lens = {
    'when using identity lens with get should get original object': _.check(
        function(a) {
            var o = _.singleton('a', a);
            return _.equal(_.Lens.identityLens('a').run(o).get(), o);
        },
        [_.AnyVal]
    ),
    'when using identity lens with set should return value': _.check(
        function(a) {
            var o = _.singleton('a', 'nothing');
            return _.equal(_.Lens.identityLens('a').run(o).set(a), a);
        },
        [_.AnyVal]
    ),
    'when using identity lens with set should not change any values': _.check(
        function(a) {
            var o = _.singleton('a', 'nothing'),
                s = _.Lens.identityLens('a').run(o);

            s.set(a);

            return _.equal(s.get(), _.singleton('a', 'nothing'));
        },
        [_.AnyVal]
    ),
    'when using object lens with get should get correct value': _.check(
        function(a) {
            var o = _.singleton('a', a);
            return _.equal(_.Lens.objectLens('a').run(o).get(), a);
        },
        [_.AnyVal]
    ),
    'when using object lens with set should set correct value': _.check(
        function(a) {
            var o = _.singleton('a', 'nothing'),
                x = _.Lens.objectLens('a').run(o).set(a);

            return _.equal(x, _.singleton('a', a));
        },
        [_.AnyVal]
    ),
    'when using object lens with set then get should get correct value': _.check(
        function(a) {
            var o = _.singleton('a', 'nothing'),
                l = _.Lens.objectLens('a'),
                x = l.run(l.run(o).set(a)).get();

            return _.equal(x, a);
        },
        [_.AnyVal]
    ),
    'when using array lens with get should get correct value': _.check(
        function(a) {
            var index = Math.floor(_.randomRange(0, a.length));
            return _.equal(_.Lens.arrayLens(index).run(a).get(), a[index]);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when using array lens with set should set correct value': _.check(
        function(a, b) {
            var index = Math.floor(_.randomRange(0, a.length)),
                x = _.Lens.arrayLens(index).run(a).set(b),
                expected = a.slice();

            expected[index] = b;

            return _.equal(x, expected);
        },
        [_.arrayOf(_.AnyVal), _.AnyVal]
    ),
    'when using array lens with set then get should get correct value': _.check(
        function(a, b) {
            var index = Math.floor(_.randomRange(0, a.length)),
                l = _.Lens.arrayLens(index),
                x = l.run(l.run(a).set(b)).get();

            return _.equal(x, b);
        },
        [_.arrayOf(_.AnyVal), _.AnyVal]
    ),
    'when using object lens over a complex object, get should the correct value': _.check(
        function(a) {
            var c = _.Lens.objectLens('c'),
                z = _.Lens.objectLens('z');

            return _.equal(c.andThen(z).run(a).get(), a.c.z);
        },
        [
            _.objectLike({
                a: String,
                b: Number,
                c: _.objectLike({
                    x: String,
                    y: Array,
                    z: Number
                })
            })
        ]
    ),
    'when using parse over a complex object, get should the correct value': _.check(
        function(a) {
            return _.equal(_.Lens.parse('c.z.i').run(a).get(), a.c.z.i);
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
    'when using parse over a complex object, set should set the correct value': _.check(
        function(a, b) {
            var r = _.Lens.parse('c.z.i').run(a).set(b),
                expected = copy(a);

            expected.c.z.i = b;

            return _.equal(r, expected);
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
            }),
            _.AnyVal
        ]
    ),
    'when using parse over a complex object, set then get should get the correct value': _.check(
        function(a, b) {
            var s = _.Lens.parse('c.z.i');
            return _.equal(s.run(s.run(a).set(b)).get(), b);
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
            }),
            _.AnyVal
        ]
    ),
    'when using parse over a complex object with array access, get should the correct value': _.check(
        function(a) {
            if (a.c.z.i.length < 1) return true;
            return _.equal(_.Lens.parse('c.z..i[0].e').run(a).get(), a.c.z.i[0].e);
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
    ),
    'when using parse over a complex object with array access, set should set the correct value': _.check(
        function(a, b) {
            if (a.c.z.i.length < 1) return true;

            var expected = copy(a);

            expected.c.z.i[0].e = b;

            return _.equal(_.Lens.parse('c.z..i[0].e').run(a).set(b), expected);
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
            }),
            _.AnyVal
        ]
    ),
    'when using parse over a complex object with array access, set the get should get the correct value': _.check(
        function(a, b) {
            if (a.c.z.i.length < 1) return true;

            var s = _.Lens.parse('c.z..i[0].e');
            return _.equal(s.run(s.run(a).set(b)).get(), b);
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
            }),
            _.AnyVal
        ]
    )
};

exports.partialLens = {
    'when creating a partial lens from a lens within range should return correct value': _.check(
        function(a) {
            var index = a.length,
                actual = _.Lens.arrayLens(index - 1).toPartial().run(a).fold(
                    function(x) {
                        return x.get();
                    },
                    _.error('Failed if called')
                ),
                expected = index < 1 ? undefined : a[index - 1];
            return _.equal(actual, expected);
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when using PartialLens with identity should return correct value': _.check(
        function(a) {
            var c = _.PartialLens.identityLens();

            return _.equal(
                c.run(a).get().get(),
                a
            );
        },
        [Object]
    ),
    'when using PartialLens with array should return correct value': _.check(
        function(a) {
            var index = a.length,
                c = _.PartialLens.arrayLens(index - 1);

            return _.equal(
                c.run(a).fold(
                    function(x) {
                        return _.Some(x.get());
                    },
                    function() {
                        return _.None;
                    }
                ),
                index < 1 ? _.None : _.Some(a[index - 1])
            );
        },
        [_.arrayOf(_.AnyVal)]
    ),
    'when using PartialLens with get should only retrieve numbers over and including 0': _.check(
        function(a) {
            var c = _.PartialLens.objectLens('c'),
                x = _.PartialLens.objectLens('x'),
                cx = c.andThen(x),
                result = a.filter(function(d) {
                    return cx.run(d).fold(
                        function(store) {
                            return store.get() >= 0 ;
                        },
                        _.constant(false)
                    );
                });

            return _.equal(
                result,
                a.filter(function(e) {
                    return e.c.x >= 0;
                })
            );
        },
        [
            _.arrayOf(
                _.objectLike({
                    c: _.objectLike({
                        x: Number
                    }),
                    d: _.OptionalVal
                })
            )
        ]
    ),
    'when using PartialLens with set should only set values that exist': _.check(
        function(a, b) {
            var c = _.PartialLens.objectLens('c'),
                x = _.PartialLens.objectLens('x'),
                cx = c.andThen(x),
                result = cx.run(a).fold(
                    function(store) {
                        return store.set(b);
                    },
                    _.constant(a)
                ),
                expected = copy(a);

            if ('x' in expected.c) {
                expected.c.x = b;
            }

            return _.equal(
                result,
                expected
            );
        },
        [
            _.objectLike({
                c: _.objectLike({
                    x: _.OptionalVal
                })
            }),
            _.AnyVal
        ]
    )
};