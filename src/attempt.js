//
//   # Attempt
//
//        Attempt e v = Failure e + Success v
//
//   The Attempt data type represents a "Success" value or a
//   semigroup of "Failure" values. Attempt has an applicative
//   functor which collects Failures' errors or creates a new Success
//   value.
//
//   Here's an example function which validates a String:
//
//        function nonEmpty(field, string) {
//            return string
//                ? squishy.Success(string)
//                : squishy.Failure([field + " must be non-empty"]);
//        }
//
//   ## Success(value)
//
//   Represents a Successful `value`.
//
//   ## Failure(errors)
//
//   Represents a Failure.
//
//   * `ap(b, concat)` - Applicative ap(ply)
//   * `equal(a)` - `true` if `a` is equal to `this`
//   * `extract()` - extract the value from attempt
//   * `flatMap(f)` - Monadic flatMap/bind
//   * `fold(a, b)` - `a` applied to value if `Left(x)`, `b` if `Right(x)`
//   * `map(f)` - Functor map
//   * `swap()` - Swap values
//   * `isSuccess` - `true` if `this` is `Success(x)`
//   * `isFailure` - `true` if `this` is `Failure(x)`
//   * `toArray()` - `[x]` if `Success(x)`, `[]` if `Failure(x)`
//   * `toOption()` - `Some(x)` if `Success(x)`, `None` if `Failure(x)`
//   * `toStream()` - `Stream.of(x)` if `Success(x)`, `Stream.empty()` if `Failure(x)`
//   * `toLeft(r)` - `Left(x)` if `Success(x)`, `Right(r)` if `Failure(x)`
//   * `toRight(l)` - `Right(x)` if `Success(x)`, `Left(l)` if `Failure(x)`
//
var Attempt = taggedSum('Attempt', {
    Success: ['value'],
    Failure: ['errors']
});

//
//  ### ap(b, concat)
//
//  Apply a function in the environment of the success of this attempt,
//  accumulating errors
//  Applicative ap(ply)
//
Attempt.prototype.ap = function(b, concat) {
    var a = this;
    return a.match({
        Success: function(value) {
            return squishy.map(b, value);
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

//
//  ### equal(a)
//
//  Compare two attempt values for equality
//
Attempt.prototype.equal = function(a) {
    return this.match({
        Success: function(x) {
            return a.match({
                Success: function(y) {
                    return squishy.equal(x, y);
                },
                Failure: constant(false)
            });
        },
        Failure: function(x) {
            return a.match({
                Success: constant(false),
                Failure: function(y) {
                    return squishy.equal(x, y);
                }
            });
        }
    });
};

//
//  ### extract()
//
//  Extract the value from the attempt.
//
Attempt.prototype.extract = function() {
    return this.match({
        Success: identity,
        Failure: identity
    });
};

//
//  ### flatMap(f)
//
//  Bind through the success of the attempt
//  Monadic flatMap/bind
//
Attempt.prototype.flatMap = function(f) {
    return this.match({
        Success: function(a) {
            return f(a);
        },
        Failure: identity
    });
};

//
//  ### fold(a, b)
//
//  Catamorphism. Run the first given function if failure, otherwise,
//  the second given function.
//   `a` applied to value if `Success`, `b` if `Failure`
//
Attempt.prototype.fold = function(a, b) {
    return this.match({
        Success: a,
        Failure: b
    });
};

//
//  ### map(f)
//
//  Map on the success of this attempt.
//  Functor map
//
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

//
//  ### swap()
//
//  Flip the failure/success values in this attempt.
//
Attempt.prototype.swap = function() {
    return this.match({
        Success: Attempt.Failure,
        Failure: Attempt.Success
    });
};

//
//  ### toOption()
//
//  Return an empty option or option with one element on the success
//  of this attempt.
//  `Some(x)` if `Success(x)`, `None` if `Failure()`
//
Attempt.prototype.toOption = function() {
    return this.match({
        Success: Option.Some,
        Failure: function() {
            return Option.None;
        }
    });
};

//
//  ### toLeft()
//
//  Return an left either bias if attempt is a success.
//  `Left(x)` if `Success(x)`, `Right(x)` if `Failure(x)`
//
Attempt.prototype.toLeft = function() {
    return this.match({
        Success: Either.Left,
        Failure: Either.Right
    });
};

//
//  ### toRight()
//
//  Return an right either bias if attempt is a success.
//  `Right(x)` if `Success(x)`, `Left(x)` if `Failure(x)`
//
Attempt.prototype.toRight = function() {
    return this.match({
        Success: Either.Left,
        Failure: Either.Right
    });
};

//
//  ### toArray()
//
//  Return an empty array or array with one element on the success
//  of this attempt.
//
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
//  ### toStream()
//
//  Return an empty stream or stream with one element on the success
//  of this attempt.
//
Attempt.prototype.toStream = function() {
    return this.match({
        Success: Stream.of,
        Failure: Stream.empty
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
//  ## Failure(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.Failure.prototype.isSuccess = false;
Attempt.Failure.prototype.isFailure = true;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Attempt.Success` with value of `x`.
//
Attempt.of = function(x) {
    return Attempt.Success(x);
};

//
//  ## empty()
//
//  Constructor `empty` Monad creating `Attempt.Failure`.
//
Attempt.empty = function() {
    return Attempt.Failure();
};

//
//  ## isAttempt(a)
//
//  Returns `true` if `a` is a `Success` or a `Failure`.
//
var isAttempt = isInstanceOf(Attempt);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Attempt', Attempt)
    .property('Success', Attempt.Success)
    .property('Failure', Attempt.Failure)
    .property('isAttempt', isAttempt)
    .method('of', strictEquals(Attempt), function(x) {
        return Attempt.of(x);
    })
    .method('empty', strictEquals(Attempt), function() {
        return Attempt.empty();
    })
    .method('ap', isAttempt, function(a, b) {
        return a.ap(b, this.concat);
    })
    .method('arb', strictEquals(Attempt.Success), function(a, b) {
        return Attempt.Success(this.arb(AnyVal, b - 1));
    })
    .method('arb', strictEquals(Attempt.Failure), function(a, b) {
        return Attempt.Failure(this.arb(arrayOf(AnyVal), b - 1));
    })
    .method('flatMap', isAttempt, function(a, b) {
        return a.flatMap(b);
    })
    .method('equal', isAttempt, function(a, b) {
        return a.equal(b);
    })
    .method('extract', isAttempt, function(a) {
        return a.extract();
    })
    .method('fold', isAttempt, function(a, b, c) {
        return a.fold(b, c);
    })
    .method('map', isAttempt, function(a, b) {
        return a.map(b);
    })
    .method('toArray', isAttempt, function(a) {
        return a.toArray();
    })
    .method('toStream', isAttempt, function(a) {
        return a.toStream();
    });
