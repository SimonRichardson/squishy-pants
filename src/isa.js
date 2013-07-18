//
//  ## isTypeOf(a)(b)
//
//  Returns `true` if `b` has `typeof a`.
//
var isTypeOf = curry(function(a, b) {
    return typeof b === a;
});

//
//  ## isBoolean(a)
//
//  Returns `true` if `a` is a `Boolean`.
//
var isBoolean = isTypeOf('boolean');

//
//  ## isFunction(a)
//
//  Returns `true` if `a` is a `Function`.
//
var isFunction = isTypeOf('function');

//
//  ## isNumber(a)
//
//  Returns `true` if `a` is a `Number`.
//
var isNumber = isTypeOf('number');

//
//  ## isObject(a)
//
//  Returns `true` if `a` is a `Object`.
//
var isObject = isTypeOf('object');

//
//  ## isString(a)
//
//  Returns `true` if `a` is a `String`.
//
var isString = isTypeOf('string');

//
//  ## isArray(a)
//
//  Returns `true` if `a` is an `Array`.
//
function isArray(a) {
    if(Array.isArray) return Array.isArray(a);
    else return Object.prototype.toString.call(a) === "[object Array]";
}

//
//  ## isEven(a)
//
//  Returns `true` if `a` is even.
//
function isEven(a) {
    return (a & 1) === 0;
}

//
//  ## isOdd(a)
//
//  Returns `true` if `a` is odd.
//
function isOdd(a) {
    return !isEven(a);
}

//
//  ## isInstanceOf(a)(b)
//
//  Returns `true` if `a` is an instance of `b`.
//
var isInstanceOf = curry(function(a, b) {
    return b instanceof a;
});

//
//  ## isArrayOf(a)
//
//  Returns `true` if `a` is an instance of `arrayOf`.
//
var isArrayOf = isInstanceOf(arrayOf);


//
//  ## isObjectLike(a)
//
//  Returns `true` if `a` is an instance of `objectLike`.
//
var isObjectLike = isInstanceOf(objectLike);

//
//  ## isAnyOf(a)(b)
//
//  Returns `true` if `b` is any `strictEquals [a]`.
//
var isAnyOf = curry(function(a, b) {
    var i;

    for(i = 0; i < a.length; i++) {
        if(strictEquals(a[i])(b)) {
            return true;
        }
    }

    return false;
});

//
//  ## isAnyTypeOf(a)(b)
//
//  Returns `true` if `b` is any `typeof [a]`.
//
var isAnyTypeOf = curry(function(a, b) {
    var i;

    for(i = 0; i < a.length; i++) {
        if(isTypeOf(a[i])(b)) {
            return true;
        }
    }

    return false;
});

//
//  ## isAnyInstanceOf(a)(b)
//
//  Returns `true` if `b` is any `instanceof [a]`.
//
var isAnyInstanceOf = curry(function(a, b) {
    var i;

    for(i = 0; i < a.length; i++) {
        if(isInstanceOf(a[i])(b)) {
            return true;
        }
    }

    return false;
});

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('isTypeOf', isTypeOf)
    .property('isBoolean', isBoolean)
    .property('isFunction', isFunction)
    .property('isNumber', isNumber)
    .property('isObject', isObject)
    .property('isString', isString)
    .property('isArray', isArray)
    .property('isEven', isEven)
    .property('isOdd', isOdd)
    .property('isInstanceOf', isInstanceOf)
    .property('isArrayOf', isArrayOf)
    .property('isObjectLike', isObjectLike)
    .property('isAnyOf', isAnyOf)
    .property('isAnyTypeOf', isAnyTypeOf)
    .property('isAnyInstanceOf', isAnyInstanceOf);

