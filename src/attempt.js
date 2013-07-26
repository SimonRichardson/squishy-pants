//
//  # Attempt
//
//       Attempt e v = Failure e + Success v
//
//  The Attempt data type represents a "success" value or a
//  semigroup of "failure" values. Attempt has an applicative
//  functor which collects failures' errors or creates a new success
//  value.
//
//  Here's an example function which validates a String:
//
//       function nonEmpty(field, string) {
//           return string
//               ? squishy.success(string)
//               : squishy.failure([field + " must be non-empty"]);
//       }
//
//  ## success(value)
//
//  Represents a successful `value`.
//
//  ## failure(errors)
//
//  Represents a failure.
//
//  * `ap(b, concat)` - Applicative ap(ply)
//  * `flatMap(f)` - Monadic flatMap/bind
//  * `fold(a, b)` - `a` applied to value if `left`, `b` if `right`
//  * `map(f)` - Functor map
//  * `swap()` - Swap values
//  * `isSuccess` - `true` if `this` is `success`
//  * `isFailure` - `true` if `this` is `failure`
//  * `toOption(r)` - `Some(x)` if `success(x)`, `none` if `failure()`
//  * `toLeft(r)` - `left(x)` if `Some(x)`, `right(r)` if none
//  * `toRight(l)` - `right(x)` if `Some(x)`, `left(l)` if none
//

var Attempt = taggedSum('Attempt', {
    success: ['value'],
    failure: ['errors']
});

Attempt.prototype.ap = function(b, concat) {
    var a = this;
    return a.match({
        success: function(value) {
            return b.map(value);
        },
        failure: function(e) {
            return b.match({
                success: function(value) {
                    return a;
                },
                failure: function(errors) {
                    return Attempt.failure(concat(e, errors));
                }
            });
        }
    });
};

Attempt.prototype.flatMap = function(f) {
    return this.match({
        success: function(a) {
            return f(a);
        },
        failure: function(e) {
            return Attempt.failure(e);
        }
    });
};

Attempt.prototype.fold = function(a, b) {
    return this.match({
        success: function(x) {
            return a(x);
        },
        failure: function(x) {
            return b(x);
        }
    });
};

Attempt.prototype.map = function(f) {
    return this.match({
        success: function(a) {
            return Attempt.success(f(a));
        },
        failure: function(e) {
            return Attempt.failure(e);
        }
    });
};

Attempt.prototype.swap = function() {
    return this.match({
        success: Attempt.failure,
        failure: Attempt.success
    });
};

Attempt.prototype.toOption = function() {
    return this.match({
        success: Option.Some,
        failure: function() {
            return Option.none;
        }
    });
};

Attempt.prototype.toLeft = function() {
    return this.match({
        success: Either.left,
        failure: Either.right
    });
};

Attempt.prototype.toRight = function() {
    return this.match({
        success: Either.left,
        failure: Either.right
    });
};

Attempt.prototype.toArray = function() {
    return this.match({
        success: function(x) {
            return [x];
        },
        failure: function(x) {
            return [];
        }
    });
};

//
//  ## success(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.success.prototype.isSuccess = true;
Attempt.success.prototype.isFailure = false;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Attempt.success` with value of `x`.
//
Attempt.success.of = function(x) {
    return Attempt.success(x);
};

//
//  ## failure(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.failure.prototype.isSuccess = false;
Attempt.failure.prototype.isFailure = true;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Attempt.failure` with value of `x`.
//
Attempt.failure.of = function(x) {
    return Attempt.failure(x);
};

//
//  ## isAttempt(a)
//
//  Returns `true` iff `a` is a `success` or a `failure`.
//
var isAttempt = isInstanceOf(Attempt);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('success', Attempt.success)
    .property('failure', Attempt.failure)
    .property('isAttempt', isAttempt)
    .method('ap', isAttempt, function(a, b) {
        return a.ap(b, this.concat);
    })
    .method('flatMap', isAttempt, function(a, b) {
        return a.flatMap(b);
    })
    .method('fold', isAttempt, function(a, b, c) {
        return a.fold(b, c);
    })
    .method('map', isAttempt, function(a, b) {
        return a.map(b);
    })
    .method('toArray', isAttempt, function(a) {
        return a.toArray();
    });
