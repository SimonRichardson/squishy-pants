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
    })
    .method('map', isArray, function(a, b) {
        var accum = [],
            i;

        for(i = 0; i < a.length; i++) {
            accum[i] = b(a[i]);
        }

        return accum;
    })
    .method('concat', isArray, function(a, b) {
        return a.concat(b);
    })
    .method('ap', isArray, function(a, b) {
        var accum = [],
            i,
            j;

        for(i = 0; i < a.length; i++) {
            for(j = 0; j < b.length; j++) {
                accum.push(a[i](b[j]));
            }
        }

        return accum;
    });

squishy = squishy
    .property('oneOf', function(a) {
        return a[Math.floor(this.randomRange(0, a.length))];
    })
    .property('randomRange', function(a, b) {
        return Math.random() * (b - a) + a;
    });

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

