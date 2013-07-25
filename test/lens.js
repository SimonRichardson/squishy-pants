var _ = require('./lib/test');

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
                copy = a.slice();

            copy[index] = b;

            return _.equal(x, copy);
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
        [_.objectLike({
            a: String,
            b: Number,
            c: _.objectLike({
                x: String,
                y: Array,
                z: Number
            })
        })]
    ),
    'when using parse over a complex object, get should the correct value': _.check(
        function(a) {
            return _.equal(_.Lens.parse('c.z.i').run(a).get(), a.c.z.i);
        },
        [_.objectLike({
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
        })]
    ),
    'when using parse over a complex object with array access, get should the correct value': _.check(
        function(a) {
            if (a.c.z.i.length < 1) return true;
            return _.equal(_.Lens.parse('c.z..i[0].e').run(a).get(), a.c.z.i[0].e);
        },
        [_.objectLike({
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
        })]
    )
};