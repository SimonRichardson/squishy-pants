//
//   # Array
//
//        Array a
//
//   Represents a sequence of values that are indexed by integers.
//
//   * `ap(a, b)` - Applicative ap(ply)
//   * `chain(a, f)` - Applies the given function f to each element of this array, then concatenates the results.
//   * `concat(a, b)` - Appends two array objects.
//   * `count(a, f)` - Count the number of elements in the array which satisfy a predicate.
//   * `drop(a, n)` - Returns the array without its n first elements. If this array has less than n elements, the empty array is returned.
//   * `dropRight(a, n)` - Returns the array without its rightmost `n` elements.
//   * `dropWhile(a, f)` - Returns the longest suffix of this array whose first element does not satisfy the predicate.
//   * `exists(a, f)` - Tests the existence in this array of an element that satisfies the predicate.
//   * `filter(a, f)` - Returns all the elements of this array that satisfy the predicate p.
//   * `find(a)` - Returns the element in this array of an element that satisfies the predicate.
//   * `first(a)` - Retrieve the first value.
//   * `flatten(a)` - Concatenate nested elements of this array.
//   * `fold(a, v, f)` - Combines the elements of this array together using the binary function f, from Left to Right, and starting with the value v.
//   * `foldRight(a, v, f)` - Combines the elements of this array together using the binary function f, from Right to Left, and starting with the value v.
//   * `last(a)` - Retrieve the last value.
//   * `map(a, f)` - Returns the array resulting from applying the given function f to each element of this array.
//   * `partition(a, f)` - Partition the array in two sub-arrays according to a predicate.
//   * `reduce(a, f)` - Combines the elements of this array together using the binary operator op, from Left to Right
//   * `reduceRight(a, f)` - Combines the elements of this array together using the binary operator op, from Right to Left
//   * `tail(n)` - Returns the tail elements of this array.
//   * `take(n)` - Returns the n first elements of this array.
//   * `takeRight(n)` - Returns the rightmost n elements from this array.
//   * `takeWhile(f)` - Returns the longest prefix of this array whose elements satisfy the predicate.
//   * `zip(a, b)` - Returns a array formed from this array and the specified array that by associating each element of the former with the element at the same position in the latter.
//   * `zipWithIndex(a)` -  Returns a array form from this array and a index of the value that is associated with each element index position.
//

//
//  ### ap(b, [concat])
//
//  Apply a function in the applicative of each function
//  Applicative ap(ply)
//
var ap = curry(function(a, b) {
    var accum = [],
        x = a.length,
        y = b.length,
        i,
        j;

    for(i = 0; i < x; i++) {
        for(j = 0; j < y; j++) {
            accum.push(a[i](b[j]));
        }
    }

    return accum;
});

//
//  ### chain(f)
//
//  Applies the given function f to each element of this array, then
//  concatenates the results.
//
var chain = curry(function(a, f) {
    var accum = [],
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        accum = accum.concat(f(a[i]));
    }

    return accum;
});

//
//  ### concat(b)
//
//  Appends two array objects.
//  semigroup concat
//
var concat = curry(function(a, b) {
    return a.concat(b);
});

//
//  ### count(f)
//
//  Count the number of elements in the array which satisfy a predicate.
//
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

//
//  ### drop(f)
//
//  Returns the array without its n first elements. If this array has
//  less than n elements, the empty array is returned.
//
var drop = curry(function(a, n) {
    return a.slice(n);
});

//
//  ### dropRight(n)
//
//  Returns the array without its rightmost `n` elements.
//
var dropRight = curry(function(a, n) {
    return a.slice(0, -n);
});

//
//  ### dropWhile(f)
//
//  Returns the longest suffix of this array whose first element
//  does not satisfy the predicate.
//
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

//
//  ### exists(f)
//
//  Tests the existence in this array of an element that satisfies
//  the predicate.
//
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

//
//  ### flatten(a)
//
//  Concatenate nested elements of this array.
//
var flatten = curry(function(a) {
    return chain(a, function(b) {
        return isArray(b) ? b : [b];
    });
});

//
//  ### filter(f)
//
//  Returns all the elements of this array that satisfy the predicate p.
//
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

//
//  ### find(f)
//
//  Returns the element in this array of an element that satisfies
//  the predicate.
//
var find = curry(function(a, f) {
    var total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        if(f(a[i])) {
            return a[i];
        }
    }

    return null;
});

//
//  ### first(a)
//
//  Retrieve the first value.
//
var first = function(a) {
    return a[0];
};

//
//  ### fold(v, f)
//
//  Combines the elements of this array together using the binary function f,
//  from Left to Right, and starting with the value v.
//
var fold = curry(function(a, v, f) {
    var total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        v = f(v, a[i]);
    }

    return v;
});

//
//  ### foldRight(v, f)
//
//  Combines the elements of this array together using the binary function f,
//  from Right to Left, and starting with the value v.
//
var foldRight = curry(function(a, v, f) {
    var i;

    for (i = a.length - 1; i >= 0; --i) {
        v = f(v, a[i]);
    }

    return v;
});

//
//  ### last(f)
//
//  Retrieve the last value
//
var last = function(a) {
    return a[a.length - 1];
};

//
//  ### map(f)
//
//  Returns the array resulting from applying the given function f to each
//  element of this array.
//
var map = curry(function(a, f) {
    var accum = [],
        total,
        i;

    for (i = 0, total = a.length; i < total; i++) {
        accum[i] = f(a[i]);
    }

    return accum;
});

//
//  ### partition(f)
//
//  Partition the array in two sub-arrays according to a predicate.
//
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

//
//  ### reduce(f)
//
//  Combines the elements of this array together using the binary operator
//  op, from Left to Right
//
var reduce = curry(function(a, f) {
    var v = a[0] || null,
        total,
        i;

    for (i = 1, total = a.length; i < total; i++) {
        v = f(v, a[i]);
    }

    return v;
});

//
//  ### reduceRight(f)
//
//  Combines the elements of this array together using the binary operator
//  op, from Right to Left
//
var reduceRight = curry(function(a, f) {
    var total = a.length,
        v = a[total - 1] || null,
        i;

    for (i = total - 2; i >= 0; --i) {
        v = f(v, a[i]);
    }

    return v;
});

//
//  ### tail(a)
//
//  Returns the tail elements of this array.
//
var tail = function(a) {
    return a.slice(1);
};

//
//  ### take(v, f)
//
//  Returns the n first elements of this array.
//
var take = curry(function(a, m) {
    return a.slice(0, m);
});

//
//  ### takeRight(n)
//
//  Returns the rightmost n elements from this array.
//
var takeRight = curry(function(a, n) {
    return a.slice(-n);
});

//
//  ### takeWhile(v, f)
//
//  Returns the longest prefix of this array whose elements satisfy
//  the predicate.
//
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

//
//  ### zip(b)
//
//  Returns a array formed from this array and the specified array that
//  by associating each element of the former with the element at the same
//  position in the latter.
//
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
//  ### zipWithIndex()
//
//  Returns a array form from this array and a index of the value that
//  is associated with each element index position.
//
var zipWithIndex = curry(function(a) {
    var accum = [],
        total = a.length,
        i;

    for (i = 0; i < total; i++) {
        accum[i] = Tuple2(a[i], i);
    }

    return accum;
});

//
//  append methods to the squishy environment.
//
squishy = squishy
    .method('ap', isArray, ap)
    .method('chain', isArray, chain)
    .method('concat', isArray, concat)
    .method('count', isArray, count)
    .method('drop', isArray, drop)
    .method('dropRight', isArray, dropRight)
    .method('dropWhile', isArray, dropWhile)
    .method('exists', isArray, exists)
    .method('flatten', isArray, flatten)
    .method('filter', isArray, filter)
    .method('find', isArray, find)
    .method('first', isArray, first)
    .method('fold', isArray, fold)
    .method('foldRight', isArray, foldRight)
    .method('last', isArray, last)
    .method('map', isArray, map)
    .method('partition', isArray, partition)
    .method('reduce', isArray, reduce)
    .method('reduceRight', isArray, reduceRight)
    .method('tail', isArray, tail)
    .method('take', isArray, take)
    .method('takeRight', isArray, takeRight)
    .method('takeWhile', isArray, takeWhile)
    .method('zip', isArray, zip)
    .method('zipWithIndex', isArray, zipWithIndex);
