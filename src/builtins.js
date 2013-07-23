squishy = squishy
    .method('map', isFunction, function(a, b) {
        return compose(b, a);
    })
    .method('concat', isFunction, function(a, b) {
        return a().concat(b());
    })
    .method('ap', isFunction, function(a, b) {
        return function(x) {
            return a(x)(b(x));
        };
    });

squishy = squishy
    .method('map', isBoolean, function(a, b) {
        return b(a);
    })
    .method('concat', isBoolean, function(a, b) {
        return a & b;
    })
    .method('map', squishy.liftA2(or, isNumber, isString), function(a, b) {
        return b(a);
    })
    .method('concat', squishy.liftA2(or, isNumber, isString), function(a, b) {
        return a + b;
    });

//
//
//  ### equal
//
//  Checks to see if a type equals another type. This is a uses deep equality for
//  complex structures like `object` and `array`s.
//
squishy = squishy
    .method('equal', isBoolean, strictEquals)
    .method('equal', isFunction, strictEquals)
    .method('equal', isNumber, strictEquals)
    .method('equal', isString, strictEquals)
    .method('equal', isArray, function(a, b) {
        var env = this;
        return env.fold(env.zip(a, b), true, function(v, t) {
            return v && env.equal(t._1, t._2);
        });
    })
    .method('equal', isObject, function(a, b) {
        var i;

        for (i in a) {
            if (!this.equal(a[i], b[i])) {
                return false;
            }
        }

        for (i in b) {
            if (!this.equal(b[i], a[i])) {
                return false;
            }
        }

        return true;
    });

//
//  ### empty values
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
        return function() {};
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
