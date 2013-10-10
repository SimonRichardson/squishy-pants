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
//  ## isNull(a)
//
//  Returns `true` if `a` is `null`.
//
function isNull(a) {
    return a === null;
}

//
//  ## isUndefined(a)
//
//  Returns `true` if `a` is `null`.
//
function isUndefined(a) {
    return a === void(0);
}

//
//  ## isNaN(a)
//
//  Returns `true` if `a` is a not a number including `NaN` and `Infinity`.
//
function isNaN(a) {
    return typeof a === 'number' ? (a * 0) !== 0 : true;
}

//
//  ## isNotNaN(a)
//
//  Returns `true` if `a` is not a `NaN`.
//
function isNotNaN(a) {
    return !isNaN(a);
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
//  ## isPalindrome(a)
//
//  Returns `true` if `a` is a valid palindrome.
//
function isPalindrome(s) {
    var total = s.length;
    if(total < 2) return true;
    if(s.charAt(0) !== s.charAt(total - 1)) return false;

    return isPalindrome(s.substr(1, total - 2));
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
//  ## isEnvironment(a)
//
//  Returns `true` if `a` is an instance of `environment`.
//
var isEnvironment = function(a) {
    return isInstanceOf(environment, a);
};

//
//  ## isComparable(a)
//
//  Returns `true` if `a` has a method called `equal`
//
var isComparable = flip(has)('equal');

//
//  ## isPlainObject(a)
//
//  Returns `true` if `a` is a plain object
//
/* We need a secure stateless object to test against */
var own = {};

function isPlainObject(a) {
    if(!isObject(a)) {
        return false;
    }

    /* Trap any errors that we can receive from testing host objects */
    try {
        if (a.constructor && !own.hasOwnProperty.call(a.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
    } catch (e) {
        return false;
    }

    return true;
}

//
//  ### isEmpty(a)
//
//  Checks to see if a value is empty or not.
//
//       console.log(squishy.isEmpty([])); // Outputs `true`
//
squishy = squishy
    .method('isEmpty', isBoolean, not)
    .method('isEmpty', isFunction, not)
    .method('isEmpty', isNumber, function(a) {
        return isNaN(a) || a < 1;
    })
    .method('isEmpty', isString, function(a) {
        return !/\S/.test(a);
    })
    .method('isEmpty', isArray, function(a) {
        return a.length < 1;
    })
    .method('isEmpty', isObject, function(a) {
        var i,
            index;

        for(i in o) {
            index++;
        }
        return index < 1;
    })
    .method('isEmpty', strictEquals(null), constant(false))
    .method('isEmpty', strictEquals(undefined), constant(false));

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
    .property('isNaN', isNaN)
    .property('isNotNaN', isNotNaN)
    .property('isEven', isEven)
    .property('isOdd', isOdd)
    .property('isPalindrome', isPalindrome)
    .property('isInstanceOf', isInstanceOf)
    .property('isArrayOf', isArrayOf)
    .property('isObjectLike', isObjectLike)
    .property('isAnyOf', isAnyOf)
    .property('isAnyTypeOf', isAnyTypeOf)
    .property('isAnyInstanceOf', isAnyInstanceOf)
    .property('isEnvironment', isEnvironment)
    .property('isComparable', isComparable)
    .property('isPlainObject', isPlainObject);

