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
//   * `ap(b)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `equal(a)` - `true` if `a` is equal to `this`
//   * `extract()` - extract the value from attempt
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
    return Attempt.Failure([]);
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the success of this `Attempt`,
//  accumulating errors
//  Applicative ap(ply)
//
Attempt.prototype.ap = function(b) {
    var env = this;
    return env.match({
        Success: function(value) {
            return squishy.map(b, value);
        },
        Failure: function(e) {
            return b.match({
                Success: constant(env),
                Failure: function(errors) {
                    return Attempt.Failure(squishy.concat(e, errors));
                }
            });
        }
    });
};

//
//  ### chain(f)
//
//  Bind through the success of the `Attempt`
//  Monadic flatMap/bind
//
Attempt.prototype.chain = function(f) {
    var env = this;
    return env.match({
        Success: f,
        Failure: constant(env)
    });
};

//
//  ### equal(a)
//
//  Compare two `Attempt` values for equality
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
//  Extract the value from the `Attempt`.
//
Attempt.prototype.extract = function() {
    return this.match({
        Success: identity,
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
//  Map on the success of this `Attempt`.
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
//  Flip the failure/success values in this `Attempt`.
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
//  of this `Attempt`.
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
//  Return an left either bias if `Attempt` is a success.
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
//  Return an right either bias if `Attempt` is a success.
//  `Right(x)` if `Success(x)`, `Left(x)` if `Failure(x)`
//
Attempt.prototype.toRight = function() {
    return this.match({
        Success: Either.Right,
        Failure: Either.Left
    });
};

//
//  ### toArray()
//
//  Return an empty array for a `Failure` `Attempt`.
//
Attempt.Failure.prototype.toArray = function() {
    return [];
};

//
//  ### toStream()
//
//  Return an empty stream or stream with one element on the success
//  of this `Attempt`.
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
//  Constructor to represent the existence of a value, `x`.
//
Attempt.Success.prototype.isSuccess = true;
Attempt.Success.prototype.isFailure = false;

//
//  ## Failure(x)
//
//  Constructor to represent the existence of a value, `x`.
//
Attempt.Failure.prototype.isSuccess = false;
Attempt.Failure.prototype.isFailure = true;

//
//  ## isAttempt(a)
//
//  Returns `true` if `a` is a `Success` or a `Failure`.
//
var isAttempt = isInstanceOf(Attempt);

//
//  ## successOf(type)
//
//  Sentinel value for when an success of a particular type is needed:
//
//       successOf(Number)
//
function successOf(type) {
    var self = getInstance(this, successOf);
    self.type = type;
    return self;
}

//
//  ## isSuccessOf(a)
//
//  Returns `true` if `a` is an instance of `successOf`.
//
var isSuccessOf = isInstanceOf(successOf);

//
//  ## failureOf(type)
//
//  Sentinel value for when an failure of a particular type is needed:
//
//       failureOf(Number)
//
function failureOf(type) {
    var self = getInstance(this, failureOf);
    self.type = type;
    return self;
}

//
//  ## isFailureOf(a)
//
//  Returns `true` if `a` is an instance of `failureOf`.
//
var isFailureOf = isInstanceOf(failureOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Attempt.prototype);

//
//  ### lens
//
//  Lens access for an attempt structure.
//
Attempt.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return a.match({
                    Success: function() {
                        return Attempt.of(s);
                    },
                    Failure: function() {
                        return Attempt.Failure(s);
                    }
                });
            },
            function() {
                return a.match({
                    Success: identity,
                    Failure: identity
                });
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Attempt', Attempt)
    .property('Success', Attempt.Success)
    .property('Failure', Attempt.Failure)
    .property('successOf', successOf)
    .property('failureOf', failureOf)
    .property('isAttempt', isAttempt)
    .property('isSuccessOf', isSuccessOf)
    .property('isFailureOf', isFailureOf)
    .method('of', strictEquals(Attempt), function(a, b) {
        return Attempt.of(b);
    })
    .method('empty', strictEquals(Attempt), function() {
        return Attempt.empty();
    })
    .method('arb', isSuccessOf, function(a, b) {
        return Attempt.Success(this.arb(a.type, b - 1));
    })
    .method('arb', isFailureOf, function(a, b) {
        return Attempt.Failure(this.arb(a.type, b - 1));
    })
    .method('extract', isAttempt, function(a) {
        return a.extract();
    })
    .method('fold', isAttempt, function(a, b, c) {
        return a.fold(b, c);
    })
    .method('toArray', isAttempt, function(a) {
        return a.toArray();
    })
    .method('toStream', isAttempt, function(a) {
        return a.toStream();
    })
    .method('ap', isAttempt, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isAttempt, function(a, b) {
        return a.chain(b);
    })
    .method('equal', isAttempt, function(a, b) {
        return a.equal(b);
    })
    .method('map', isAttempt, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isAttempt, function(a) {
        return [];
    });
