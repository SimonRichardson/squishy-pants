squishy = squishy
    .method('map', isFunction, curry(function(a, b) {
        return compose(b, a);
    }))
    .method('concat', isFunction, curry(function(a, b) {
        return this.concat(a(), b());
    }))
    .method('ap', isFunction, curry(function(a, b, x) {
        return a(x)(b(x));
    }));

squishy = squishy
    .method('dimap', isFunction, function(a, b) {
        var env = this;
        return function(c) {
            return compose(compose(b, c), a);
        };
    })
    .method('kleisli', isFunction, curry(function(a, b, x) {
        return this.chain(a(x), b);
    }))
    .method('tupled', isFunction, function(a, b) {
        return this.tupled(b, a);
    });

squishy = squishy
    .method('concat', isBoolean, curry(function(a, b) {
        return a & b;
    }))
    .method('concat', squishy.liftA2(or, isNumber, isString), curry(function(a, b) {
        return a + b;
    }))
    .method('map', isBoolean, curry(function(a, b) {
        return b(a);
    }))
    .method('map', squishy.liftA2(or, isNumber, isString), curry(function(a, b) {
        return b(a);
    }))
    .method('negate', isBoolean, function(a) {
        return !a;
    })
    .method('negate', isNumber, function(a) {
        return -a;
    });

//
//  ### equal(a, b)
//
//  Checks to see if a type equals another type. This is a uses deep equality for
//  complex structures like `object` and `array`s.
//
squishy = squishy
    .method('equal', isNull, strictEquals)
    .method('equal', isBoolean, strictEquals)
    .method('equal', isFunction, strictEquals)
    .method('equal', isNumber, strictEquals)
    .method('equal', isString, strictEquals)
    .method('equal', isArray, function(a, b) {
        var env = this;
        /* We need to be sure that the lengths do actually match here. */
        if (and(a, b) && isArray(b) && strictEquals(a.length, b.length)) {
            return env.fold(env.zip(a, b), true, function(v, t) {
                return v && env.equal(t._1, t._2);
            });
        }
        return false;
    })
    .method('equal', strictEquals(undefined), strictEquals)
    .method('equal', squishy.liftA2(and, isObject, andThen(isComparable, not)), function(a, b) {
        var i;
        /* We need to be sure that the there is an `a` and a `b` here. */
        if (and(a, b) && isObject(b)) {
            /* This would be better if we turn objects into ordered
               arrays so we can pass it through equal(a, b) */
            for (i in a) {
                if (!squishy.equal(a[i], b[i]))
                    return false;
            }
            for (i in b) {
                if (!squishy.equal(b[i], a[i]))
                    return false;
            }
            return true;
        }
        return false;
    })
    .property('expect', function(a) {
        var env = this;
        return singleton('toBe',
            function (b) {
                return env.equal(b, a);
            }
        );
    });

//
//  ### of(a)
//
//  Creates a value from the type.
//
//  The left identity of `squishy.of(m, a).chain(f)` is equivalent to
//  `f(squishy.of(m, a))` and then equivalent of `f(a)` without using `squishy.of`.
//  Similarly the right identity of `squishy.chain(m, m.of)` is equivalent to
//  `m` or `m.chain(m.of)` without using `squishy.of`.
//
//       console.log(squishy.of(Array, [1, 2, 3])); // Outputs `[1, 2, 3]`
//
squishy = squishy
    .method('of', strictEquals(AnyVal), function() {
        var types = [Boolean, Number, String];
        return this.of(this.oneOf(types));
    })
    .method('of', strictEquals(Array), identity)
    .method('of', strictEquals(Boolean), identity)
    .method('of', strictEquals(Function), identity)
    .method('of', strictEquals(Number), identity)
    .method('of', strictEquals(Object), identity)
    .method('of', strictEquals(String), identity);

//
//  ### empty()
//
//  Creates an empty value depending on the type. Each resulting value
//  will be classified as falsy for the type. Boolean will be
//  `false` and Array will be an empty `[]` for example.
//
//       console.log(squishy.empty(Array)); // Outputs `[]`
//
squishy = squishy
    .method('empty', strictEquals(AnyVal), function() {
        var types = [Boolean, Number, String];
        return this.empty(this.oneOf(types));
    })
    .method('empty', strictEquals(Array), function() {
        return [];
    })
    .method('empty', strictEquals(Boolean), function() {
        return false;
    })
    .method('empty', strictEquals(Function), function() {
        return nothing;
    })
    .method('empty', strictEquals(Number), function() {
        return 0;
    })
    .method('empty', strictEquals(Object), function() {
        return {};
    })
    .method('empty', strictEquals(String), function() {
        return '';
    });
