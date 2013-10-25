var _ = require('./lib/test');

exports.list = {
    'when testing Cons should return correct value': _.check(
        function(a) {
            return _.expect(_.Cons(a, _.Nil).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing Cons should return isNonEmpty': _.check(
        function(a) {
            return _.expect(_.Cons(a, _.Nil).isNonEmpty).toBe(true);
        },
        [_.AnyVal]
    ),
    'when testing Cons should return isEmpty': _.check(
        function(a) {
            return _.expect(_.Cons(a, _.Nil).isEmpty).toBe(false);
        },
        [_.AnyVal]
    ),
    'when testing Nil should return isNonEmpty': function(test) {
        test.ok(_.expect(_.Nil.isNonEmpty).toBe(false));
        test.done();
    },
    'when testing Nil should return isEmpty': function(test) {
        test.ok(_.expect(_.Nil.isEmpty).toBe(true));
        test.done();
    },
    'when testing ap with list should yield correct value': _.check(
        function(a) {
            var size = a.size(),
                expected = a.fold(_.Nil, function(x) {
                    return x.concat(a);
                }),
                concat = _.List.range(0, size).map(_.constant(_.identity));
            return _.expect(concat.ap(a)).toBe(expected);
        },
        [_.listOf(_.AnyVal)]
    ),
    'when testing append should return correct value': _.check(
        function(a) {
            return _.expect(_.Nil.append(a)).toBe(_.Cons(a, _.Nil));
        },
        [_.AnyVal]
    ),
    'when testing appendAll should return correct value': _.check(
        function(a, b) {
            return _.expect(_.Nil.appendAll(_.Cons(a, _.Cons(b, _.Nil)))).toBe(_.Cons(a, _.Cons(b, _.Nil)));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing chain should return correct value': _.check(
        function(a, b, c) {
            var list = _.Cons(b, _.Cons(a, _.Nil)),
                expected = _.Cons(c, _.Cons(b,  _.Cons(c, _.Cons(a, _.Nil))));

            return _.expect(list.chain(
                    function(a) {
                        return _.Cons(c, _.Cons(a, _.Nil));
                    }
                )).toBe(expected);
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing concat should return correct value': _.check(
        function(a, b, c) {
            return _.expect(_.Cons(a, _.Nil).concat(_.Cons(b, _.Cons(c, _.Nil)))).toBe(_.Cons(a, _.Cons(b, _.Cons(c, _.Nil))));
        },
        [_.AnyVal, _.AnyVal, _.AnyVal]
    ),
    'when testing count with list should be correct value': _.check(
        function(a) {
            var expected = _.count(a.toArray(), _.isEven);

            return _.expect(a.count(_.isEven)).toBe(expected);
        },
        [_.listOf(_.Integer)]
    ),
    'when testing drop with list should be correct value': _.check(
        function(a) {
            var x = Math.floor(_.randomRange(0, a.size())),
                expected = _.drop(a.toArray(), x);

            return _.expect(a.drop(x)).toBe(_.List.fromArray(expected));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing dropRight with list should be correct value': _.check(
        function(a) {
            var x = Math.floor(_.randomRange(0, a.size())),
                expected = _.dropRight(a.toArray(), x);

            return _.expect(a.dropRight(x)).toBe(_.List.fromArray(expected));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing dropWhile with list should be correct value': _.check(
        function(a) {
            var expected = _.dropWhile(a.toArray(), _.isEven);

            return _.expect(a.dropWhile(_.isEven)).toBe(_.List.fromArray(expected));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing equals should return correct value': _.check(
        function(a) {
            return _.expect(a).toBe(a);
        },
        [_.listOf(_.AnyVal)]
    ),
    'when testing equals which don\'t match should return correct value': function(test) {
        test.ok(!_.List.fromArray([1, 2, 3]).equal(_.List.fromArray([4, 5, 6])));
        test.done();
    },
    'when testing exists should return correct value': _.check(
        function(a) {
            var size = a.size(),
                index = _.randomRange(size ? 1 : 0, size),
                p = a.get(index);

            return _.expect(a.exists(function(v) {
                return _.equal(p, v);
            })).toBe(size ? true : false);
        },
        [_.listOf(_.AnyVal)]
    ),
    'when testing filter should return correct value': _.check(
        function(a) {
            var expected = _.List.fromArray(_.filter(a.toArray(), _.isEven));
            return _.expect(a.filter(_.isEven)).toBe(expected);
        },
        [_.listOf(_.Integer)]
    ),
    'when testing find should return correct value': _.check(
        function(a) {
            return _.expect(a.find(_.isEven)).toBe(_.find(a.toArray(), _.isEven));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing first should return correct value': _.check(
        function(a) {
            return _.expect(a.first()).toBe(_.first(a.toArray()));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing fold should return correct value': function(test) {
        var original = _.Cons(4, _.Cons(3, _.Cons(2, _.Cons(1, _.Nil)))),
            expected = _.Cons(8, _.Cons(6, _.Cons(4, _.Cons(2, _.Nil)))),
            actual = original.fold(_.Nil, function(a, b) {
                return a.append(b * 2);
            });

        test.ok(_.equal(actual, expected));
        test.done();
    },
    'when testing get should return correct value': _.check(
        function(a) {
            var size = a.size(),
                index = Math.floor(_.randomRange(0, size)),
                expected = size < 1 ? null : a.toArray()[index];

            return _.expect(a.get(index)).toBe(expected);
        },
        [_.listOf(_.Integer)]
    ),
    'when testing last should return correct value': _.check(
        function(a) {
            return _.expect(a.last()).toBe(_.last(a.toArray()));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing map should return correct value': _.check(
        function(a) {
            return _.expect(_.Cons(a, _.Nil).map(_.inc).extract()).toBe(a + 1);
        },
        [Number]
    ),
    'when testing partition should return correct value': _.check(
        function(a) {
            var x = _.partition(a.toArray(), _.isEven),
                y = _.Tuple2(_.List.fromArray(x._1), _.List.fromArray(x._2));
            return _.expect(a.partition(_.isEven)).toBe(y);
        },
        [_.listOf(_.Integer)]
    ),
    'when testing prepend should return correct value': _.check(
        function(a) {
            return _.expect(_.Nil.prepend(a)).toBe(_.Cons(a, _.Nil));
        },
        [_.AnyVal]
    ),
    'when testing prependAll should return correct value': _.check(
        function(a, b) {
            return _.expect(_.Nil.prependAll(_.Cons(a, _.Cons(b, _.Nil)))).toBe(_.Cons(b, _.Cons(a, _.Nil)));
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing reduce with list should yield items': _.check(
        function(a) {
            var sum = function(a, b) {
                    return a + b;
                },
                expected = _.reduce(a.toArray(), sum);

            return _.expect(a.reduce(sum)).toBe(expected);
        },
        [_.listOf(Number)]
    ),
    'when testing reduceRight with list should yield items': _.check(
        function(a) {
            var minus = function(a, b) {
                    return a - b;
                },
                expected = _.reduceRight(a.toArray(), minus);

            return _.expect(a.reduceRight(minus)).toBe(expected);
        },
        [_.listOf(Number)]
    ),
    'when testing reverse should return correct value': _.check(
        function(a) {
            function grab(a) {
                var accum = _.Nil,
                    p = a;

                while(p.isNonEmpty) {
                    accum = _.Cons(p.head, accum);
                    p = p.tail;
                }
                return accum;
            }
            return _.expect(a.reverse()).toBe(grab(a));
        },
        [_.listOf(_.AnyVal)]
    ),
    'when testing size should return correct value': _.check(
        function(a) {
            return _.expect(a.size()).toBe(a.toArray().length);
        },
        [_.listOf(_.AnyVal)]
    ),
    'when testing take should return correct value': _.check(
        function(a) {
            function grab(a, n) {
                var accum = _.Nil,
                  i = 0,
                  p = a;

                while(p.isNonEmpty && i < n) {
                    accum = _.Cons(p.head, accum);
                    p = p.tail;
                    i++;
                }

                return accum.reverse();
            }

            var size = a.size(),
                index = size > 0 ? size - 1 : 0,
                expected = size > 0 ? grab(a, index) : a;

            return _.expect(a.take(index)).toBe(expected);
        },
        [_.listOf(_.AnyVal)]
    ),
    'when testing takeRight with list should be correct value': _.check(
        function(a) {
            var x = Math.floor(_.randomRange(0, a.size())),
                expected = _.takeRight(a.toArray(), x);

            return _.expect(a.takeRight(x)).toBe(_.List.fromArray(expected));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing takeWhile with list should be correct value': _.check(
        function(a) {
            var expected = _.takeWhile(a.toArray(), _.isEven);

            return _.expect(a.takeWhile(_.isEven)).toBe(_.List.fromArray(expected));
        },
        [_.listOf(_.Integer)]
    ),
    'when testing zip should return correct value': _.check(
        function(a, b) {
            var expected = _.List.fromArray(_.zip(a.toArray(), b.toArray()));
            return _.expect(a.zip(b)).toBe(expected);
        },
        [_.listOf(_.AnyVal), _.listOf(_.AnyVal)]
    ),
    'when testing zipWithIndex should return correct value': _.check(
        function(a) {
            var expected = _.List.fromArray(_.zipWithIndex(a.toArray()));
            return _.expect(a.zipWithIndex()).toBe(expected);
        },
        [_.listOf(_.AnyVal)]
    ),
    'when using list lens with set should get correct value': _.check(
        function(a, b) {
            var index = Math.floor(_.randomRange(0, a.size())),
                array = a.toArray(),
                list = _.List.fromArray((function(array) {

                    if (array.length > 0) {
                        array[index] = b;
                    }

                    return array;
                })(a.toArray()));

            return _.expect(_.List.lens(index).run(a).set(b)).toBe(list);
        },
        [_.listOf(_.AnyVal), _.AnyVal]
    ),
    'when using list lens get correct value': _.check(
        function(a, b) {
            var index = Math.floor(_.randomRange(0, a.size()));
            return _.expect(_.List.lens(index).run(a).get()).toBe(a.get(index));
        },
        [_.listOf(_.AnyVal), _.AnyVal]
    ),
    'when using list cons lens get correct value': _.check(
        function(a) {
            var x = _.Cons(a, _.Nil);
            return _.expect(_.List.Cons.lens().run(x).get()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using of should be correct value': _.check(
        function(a) {
            return _.expect(_.of(_.List, a).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using empty should be correct value': _.check(
        function(a) {
            return _.expect(_.empty(_.List)).toBe(_.List.Nil);
        },
        [_.AnyVal]
    ),
    'when using shrink should be correct value': _.check(
        function(a) {
            var expected = [_.Nil],
                x = a.size();

            while(x) {
                x = Math.floor(x / 2);
                if (x) expected.push(a.dropRight(x));
            }

            return _.expect(_.shrink(a)).toBe(expected);
        },
        [_.listOf(_.AnyVal)]
    ),
    'when using concat should be correct value': _.check(
        function(a, b) {
            return _.expect(_.concat(a, b)).toBe(a.concat(b));
        },
        [_.listOf(Number), _.listOf(Number)]
    ),
    'when using count should be correct value': _.check(
        function(a) {
            return _.expect(_.count(a, _.inc)).toBe(a.count(_.inc));
        },
        [_.listOf(Number)]
    ),
    'when using drop should be correct value': _.check(
        function(a, b) {
            return _.expect(_.drop(a, b)).toBe(a.drop(b));
        },
        [_.listOf(Number), _.Integer]
    ),
    'when using dropRight should be correct value': _.check(
        function(a, b) {
            return _.expect(_.dropRight(a, b)).toBe(a.dropRight(b));
        },
        [_.listOf(Number), _.Integer]
    ),
    'when using dropWhile should be correct value': _.check(
        function(a) {
            return _.expect(_.dropWhile(a, _.isEven)).toBe(a.dropWhile(_.isEven));
        },
        [_.listOf(Number)]
    ),
    'when using exists should be correct value': _.check(
        function(a) {
            return _.expect(_.exists(a, _.isEven)).toBe(a.exists(_.isEven));
        },
        [_.listOf(Number)]
    ),
    'when using find should be correct value': _.check(
        function(a) {
            return _.expect(_.find(a, _.isEven)).toBe(a.find(_.isEven));
        },
        [_.listOf(Number)]
    ),
    'when using first should be correct value': _.check(
        function(a) {
            return _.expect(_.first(a)).toBe(a.first());
        },
        [_.listOf(Number)]
    ),
    'when using fold should be correct value': _.check(
        function(a) {
            return _.expect(_.fold(a, 0, _.add)).toBe(a.fold(0, _.add));
        },
        [_.listOf(Number)]
    ),
    'when using last should be correct value': _.check(
        function(a) {
            return _.expect(_.last(a)).toBe(a.last());
        },
        [_.listOf(Number)]
    ),
    'when using partition should be correct value': _.check(
        function(a) {
            return _.expect(_.partition(a, _.isEven)).toBe(a.partition(_.isEven));
        },
        [_.listOf(Number)]
    ),
    'when using reduce should be correct value': _.check(
        function(a) {
            return _.expect(_.reduce(a, _.add)).toBe(a.reduce(_.add));
        },
        [_.listOf(Number)]
    ),
    'when using reduceRight should be correct value': _.check(
        function(a) {
            return _.expect(_.reduceRight(a, _.add)).toBe(a.reduceRight(_.add));
        },
        [_.listOf(Number)]
    ),
    'when using take should be correct value': _.check(
        function(a, b) {
            return _.expect(_.take(a, b)).toBe(a.take(b));
        },
        [_.listOf(Number), Number]
    ),
    'when using takeRight should be correct value': _.check(
        function(a, b) {
            return _.expect(_.takeRight(a, b)).toBe(a.takeRight(b));
        },
        [_.listOf(Number), Number]
    ),
    'when using zip should be correct value': _.check(
        function(a, b) {
            return _.expect(_.zip(a, b)).toBe(a.zip(b));
        },
        [_.listOf(Number), _.listOf(Number)]
    ),
    'when using zipWithIndex should be correct value': _.check(
        function(a) {
            return _.expect(_.zipWithIndex(a)).toBe(a.zipWithIndex());
        },
        [_.listOf(Number)]
    ),
    'when using toArray should be correct value': _.check(
        function(a) {
            return _.expect(_.toArray(a)).toBe(a.toArray());
        },
        [_.listOf(Number)]
    ),
    'when using ap should be correct value': _.check(
        function(a) {
            var size = a.size(),
                concat = _.List.range(0, size).map(_.constant(_.identity));
            return _.expect(_.ap(concat, a)).toBe(concat.ap(a));
        },
        [_.listOf(Number)]
    ),
    'when using chain should be correct value': _.check(
        function(a) {
            return _.expect(_.chain(a, _.List.of)).toBe(a.chain(_.List.of));
        },
        [_.listOf(Number)]
    ),
};
