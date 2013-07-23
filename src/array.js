//
//  # Array
//
//       Array a
//
//  Represents a sequence of values that are indexed by integers.
//
//  * `ap(a, b)` - Applicative ap(ply)
//  * `concat(a, b)` - Appends two array objects.
//  * `count(a, f)` - Count the number of elements in the array which satisfy a predicate.
//  * `drop(a, n)` - Returns the array without its n first elements. If this array has less than n elements, the empty array is returned.
//  * `dropRight(a, n)` - Returns the array without its rightmost n elements.
//  * `dropWhile(a, f)` - Returns the longest suffix of this array whose first element does not satisfy the predicate.
//  * `exists(a, f)` - Tests the existence in this array of an element that satisfies the predicate.
//  * `filter(a, f)` - Returns all the elements of this array that satisfy the predicate p.
//  * `filterNot(a, f)` - Returns all the elements of this array that does not satisfy the predicate p.
//  * `flatMap(a, f)` - Applies the given function f to each element of this array, then concatenates the results.
//  * `flatten(a)` - Concatenate the elements of this array.
//  * `fold(a, v, f)` - Combines the elements of this array together using the binary function f, from left to right, and starting with the value v.
//  * `foldRight(a, v, f)` - Combines the elements of this array together using the binary function f, from right to left, and starting with the value v.
//  * `map(a, f)` - Returns the array resulting from applying the given function f to each element of this array.
//  * `partition(a, f)` - Partition the array in two sub-arrays according to a predicate.
//  * `reduce(a, f)` - Combines the elements of this array together using the binary operator op, from left to right
//  * `reduceRight(a, f)` - Combines the elements of this array together using the binary operator op, from right to left
//  * `take(n)` - Returns the n first elements of this array.
//  * `takeRight(n)` - Returns the rightmost n elements from this array.
//  * `takeWhile(f)` - Returns the longest prefix of this array whose elements satisfy the predicate.
//  * `zip(a, b)` - Returns a array formed from this array and the specified array that by associating each element of the former with the element at the same position in the latter.
//

var ap = curry(function(a, b) {
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

var count = curry(function(a, f) {
    var accum = 0,
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if(f(a[i])) {
            accum = inc(accum);
        }
    }

    return accum;
});

var drop = curry(function(a, n) {
    return a.slice(n);
});

var dropRight = curry(function(a, n) {
    return a.slice(0, -n);
});

var dropWhile = curry(function(a, f) {
    var total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if(!f(a[i])) {
            return a.slice(i);
        }
    }

    return a.slice();
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

var fold = curry(function(a, v, f) {
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

var partition = curry(function(a, f) {
    var left = [],
        right = [],
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if(f(a[i])) left.push(a[i]);
        else right.push(a[i]);
    }

    return Tuple2(left, right);
});

var reduce = curry(function(a, f) {
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

var take = curry(function(a, m) {
    return a.slice(0, m);
});

var takeRight = curry(function(a, m) {
    return a.slice(-m);
});

var takeWhile = curry(function(a, f) {
    var total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if(!f(a[i])) {
            return a.slice(0, i);
        }
    }

    return [];
});

var zip = curry(function(a, b) {
    var accum = [],
        total = Math.min(a.length, b.length),
        i;

    for (i = 0; i < total; i++) {
        accum[i] = Tuple2(a[i], b[i]);
    }

    return accum;
});

//
//  append methods to the squishy environment.
//
squishy = squishy
    .method('ap', isArray, ap)
    .method('concat', isArray, concat)
    .method('count', isArray, count)
    .method('drop', isArray, drop)
    .method('dropRight', isArray, dropRight)
    .method('dropWhile', isArray, dropWhile)
    .method('exists', isArray, exists)
    .method('get', isArray, get)
    .method('filter', isArray, filter)
    .method('filterNot', isArray, filterNot)
    .method('flatten', isArray, flatten)
    .method('flatMap', isArray, flatMap)
    .method('fold', isArray, fold)
    .method('foldRight', isArray, foldRight)
    .method('map', isArray, map)
    .method('partition', isArray, partition)
    .method('reduce', isArray, reduce)
    .method('reduceRight', isArray, reduceRight)
    .method('take', isArray, take)
    .method('takeRight', isArray, takeRight)
    .method('takeWhile', isArray, takeWhile)
    .method('zip', isArray, zip);
