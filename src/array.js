var ap = curry(function(a, b, f) {
    var accum = [],
        x,
        y,
        i,
        j;

    for(i = 0, x = a.length; i < x; i++) {
        for(j = 0, y = b.length; j < y; j++) {
            accum.push(a[i](b[j]));
        }
    }

    return accum;
});

var concat = curry(function(a, b) {
    return a.concat(b);
});

var exists = curry(function(a, f) {
    var total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if(f(a[i])) {
            return true;
        }
    }

    return false;
});

var filter = curry(function(a, f) {
    var accum = [],
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if (f(a[i])) {
            accum.push(a[i]);
        }
    }

    return accum;
});

var filterNot = curry(function(a, f) {
    var accum = [],
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if (!f(a[i])) {
            accum.push(a[i]);
        }
    }

    return accum;
});

function flatten(a) {
    return flatMap(a, function(x) {
        return squishy.toArray(x);
    });
}

var flatMap = curry(function(a, f) {
    var accum = [],
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        accum = accum.concat(f(a[i]));
    }

    return accum;
});

var foldLeft = curry(function(a, v, f) {
    var total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        v = f(v, a[i]);
    }

    return v;
});

var foldRight = curry(function(a, v, f) {
    var i;

    for (i = a.length - 1; i >= 0; --i) {
        v = f(v, a[i]);
    }

    return v;
});

var get = curry(function(a, i) {
    return a[i];
});

var map = curry(function(a, f) {
    var accum = [],
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        accum[i] = f(a[i]);
    }

    return accum;
});

var reduceLeft = curry(function(a, f) {
    var total = a.length,
        i,
        v;

    if (total < 1) return Option.none;

    for (i = 0; i < total; i++) {
        if (i === 0) v = a[i];
        else v = f(v, a[i]);
    }

    return Option.some(v);
});

var reduceRight = curry(function(a, f) {
    var total = a.length,
        i,
        v;

    if (total < 1) return Option.none;

    for (i = total - 1; i >= 0; --i) {
        if (i === 0) v = a[i];
        else v = f(v, a[i]);
    }

    return Option.some(v);
});

squishy = squishy
    .method('ap', isArray, ap)
    .method('concat', isArray, concat)
    .method('exists', isArray, exists)
    .method('filter', isArray, filter)
    .method('filterNot', isArray, filterNot)
    .method('flatten', isArray, flatten)
    .method('flatMap', isArray, flatMap)
    .method('foldLeft', isArray, foldLeft)
    .method('foldRight', isArray, foldRight)
    .method('map', isArray, map)
    .method('reduceLeft', isArray, reduceLeft)
    .method('reduceRight', isArray, reduceRight);
