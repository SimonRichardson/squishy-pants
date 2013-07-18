squishy = squishy
        .method('map', isFunction, function(a, b) {
            return compose(b, a);
        })
        .method('ap', isFunction, function(a, b) {
            return function(x) {
                return a(x)(b(x));
            };
        })
        .method('concat', isFunction, function(a, b) {
            return a().concat(b());
        });

squishy = squishy
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
        })
        .method('concat', isArray, function(a, b) {
            return a.concat(b);
        });