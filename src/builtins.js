squishy = squishy
        .method('map', isFunction, function(a, b) {
            return compose(b, a);
        })
        .method('ap', isFunction, function(a, b) {
            return function(x) {
                return a(x)(b(x));
            };
        });

squishy = squishy
        .method('map', squishy.liftA2(or, isNumber, isString), function(a, b) {
            return compose(b, a);
        });