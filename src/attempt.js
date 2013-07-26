//
//  # Attempt
//
//       Attempt e v = Failure e + Success v
//
//  The Attempt data type represents a "Success" value or a
//  semigroup of "Failure" values. Attempt has an applicative
//  functor which collects Failures' errors or creates a new Success
//  value.
//
//  Here's an example function which validates a String:
//
//       function nonEmpty(field, string) {
//           return string
//               ? squishy.Success(string)
//               : squishy.Failure([field + " must be non-empty"]);
//       }
//
//  ## Success(value)
//
//  Represents a Successful `value`.
//
//  ## Failure(errors)
//
//  Represents a Failure.
//
//  * `ap(b, concat)` - Applicative ap(ply)
//  * `flatMap(f)` - Monadic flatMap/bind
//  * `fold(a, b)` - `a` applied to value if `Left`, `b` if `Right`
//  * `map(f)` - Functor map
//  * `swap()` - Swap values
//  * `isSuccess` - `true` if `this` is `Success`
//  * `isFailure` - `true` if `this` is `Failure`
//  * `toOption(r)` - `Some(x)` if `Success(x)`, `None` if `Failure()`
//  * `toLeft(r)` - `Left(x)` if `Some(x)`, `Right(r)` if None
//  * `toRight(l)` - `Right(x)` if `Some(x)`, `Left(l)` if None
//

var Attempt = taggedSum('Attempt', {
    Success: ['value'],
    Failure: ['errors']
});

Attempt.prototype.ap = function(b, concat) {
    var a = this;
    return a.match({
        Success: function(value) {
            return b.map(value);
        },
        Failure: function(e) {
            return b.match({
                Success: function(value) {
                    return a;
                },
                Failure: function(errors) {
                    return Attempt.Failure(concat(e, errors));
                }
            });
        }
    });
};

Attempt.prototype.flatMap = function(f) {
    return this.match({
        Success: function(a) {
            return f(a);
        },
        Failure: function(e) {
            return Attempt.Failure(e);
        }
    });
};

Attempt.prototype.fold = function(a, b) {
    return this.match({
        Success: function(x) {
            return a(x);
        },
        Failure: function(x) {
            return b(x);
        }
    });
};

Attempt.prototype.map = function(f) {
    return this.match({
        Success: function(a) {
            return Attempt.Success(f(a));
        },
        Failure: function(e) {
            return Attempt.Failure(e);
        }
    });
};

Attempt.prototype.swap = function() {
    return this.match({
        Success: Attempt.Failure,
        Failure: Attempt.Success
    });
};

Attempt.prototype.toOption = function() {
    return this.match({
        Success: Option.Some,
        Failure: function() {
            return Option.None;
        }
    });
};

Attempt.prototype.toLeft = function() {
    return this.match({
        Success: Either.Left,
        Failure: Either.Right
    });
};

Attempt.prototype.toRight = function() {
    return this.match({
        Success: Either.Left,
        Failure: Either.Right
    });
};

Attempt.prototype.toArray = function() {
    return this.match({
        Success: function(x) {
            return [x];
        },
        Failure: function(x) {
            return [];
        }
    });
};

//
//  ## Success(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.Success.prototype.isSuccess = true;
Attempt.Success.prototype.isFailure = false;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Attempt.Success` with value of `x`.
//
Attempt.Success.of = function(x) {
    return Attempt.Success(x);
};

//
//  ## Failure(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.Failure.prototype.isSuccess = false;
Attempt.Failure.prototype.isFailure = true;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Attempt.Failure` with value of `x`.
//
Attempt.Failure.of = function(x) {
    return Attempt.Failure(x);
};

//
//  ## isAttempt(a)
//
//  Returns `true` iff `a` is a `Success` or a `Failure`.
//
var isAttempt = isInstanceOf(Attempt);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Success', Attempt.Success)
    .property('Failure', Attempt.Failure)
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
