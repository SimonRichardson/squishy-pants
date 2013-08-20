//
//   # Either
//
//        Either a b = Left a + Right b
//
//   Represents a tagged disjunction between two sets of values; `a` or
//   `b`. Methods are Right-biased.
//
//   * `ap(e)` - Applicative ap(ply)
//   * `concat(s, f)` - Semigroup concat
//   * `flatMap(f)` - Monadic flatMap/bind
//   * `fold(a, b)` - `a` applied to value if `Left(x)`, `b` if `Right(x)`
//   * `map(f)` - Functor map
//   * `swap()` - If this is a Left, then return the Left value in Right or vice versa.
//   * `isLeft` - `true` iff `this` is `Left(x)`
//   * `isRight` - `true` iff `this` is `Right(x)`
//   * `toOption()` - `None` if `Left(x)`, `Some(x)` value of `Right(x)`
//   * `toArray()` - `[]` if `Left(x)`, `[x]` value if `Right(x)`
//   * `toAttempt()` - `Failure(x)` if `Left(x)`, `Success(x)` value if `Right(x)`
//   * `toStream()` - `Stream.empty()` if `Left(x)`, `Stream.of(x)` value if `Right(x)`
//
var Either = taggedSum('Either', {
    Left: ['value'],
    Right: ['value']
});

//
//  ### ap(b, concat)
//
//  Apply a function in the environment of the right of this either,
//  accumulating errors
//  Applicative ap(ply)
//
Either.prototype.ap = function(e) {
    return this.match({
        Left: function() {
            return this;
        },
        Right: function(x) {
            return e.map(x);
        }
    });
};

//
//  ### concat(s, f)
//
//  Concatenate two eithers associatively together.
//  Semigroup concat
//
Either.prototype.concat = function(s, f) {
    var env = this;
    return this.match({
        Left: function() {
            return s.fold(
                constant(env),
                constant(s)
            );
        },
        Right: function(y) {
            return s.map(function(x) {
                return f(x, y);
            });
        }
    });
};

//
//  ### equal(a)
//
//  Compare two attempt values for equality
//
Either.prototype.equal = function(a) {
    return this.match({
        Left: function(x) {
            return a.match({
                Left: function(y) {
                    return squishy.equal(x, y);
                },
                Right: constant(false)
            });
        },
        Right: function(x) {
            return a.match({
                Left: constant(false),
                Right: function(y) {
                    return squishy.equal(x, y);
                }
            });
        }
    });
};

//
//  ### extract(a)
//
//  Extract the value from the either.
//
Either.prototype.extract = function() {
    return this.match({
        Left: identity,
        Right: identity
    });
};

//
//  ### flatMap(f)
//
//  Bind through the success of the either
//  Monadic flatMap/bind
//
Either.prototype.flatMap = function(f) {
    return this.match({
        Left: constant(this),
        Right: f
    });
};

//
//  ### fold(a, b)
//
//  Catamorphism. Run the first given function if failure, otherwise,
//  the second given function.
//   `a` applied to value if `Left`, `b` if `Right`
//
Either.prototype.fold = function(a, b) {
    return this.match({
        Left: a,
        Right: b
    });
};

//
//  ### map(f)
//
//  Map on the right of this either.
//  Functor map
//
Either.prototype.map = function(f) {
    return this.match({
        Left: constant(this),
        Right: function(x) {
            return Either.Right(f(x));
        }
    });
};

//
//  ### swap()
//
//  Flip the left/right values in this either.
//
Either.prototype.swap = function() {
    return this.match({
        Left: function(x) {
            return Either.Right(x);
        },
        Right: function(x) {
            return Either.Left(x);
        }
    });
};

//
//  ### toOption()
//
//  Return an empty option or option with one element on the right
//  of this either.
//  `Some(x)` if `Success(x)`, `None` if `Failure()`
//
Either.prototype.toOption = function() {
    return this.match({
        Left: function() {
            return Option.None;
        },
        Right: Option.Some
    });
};

//
//  ### toAttempt()
//
//  Return failure if either is a left and success if either is right.
//  `Left(x)` if `Failure(x)`, `Right(x)` if `Success(x)`
//
Either.prototype.toAttempt = function() {
    return this.match({
        Left: Attempt.Failure,
        Right: Attempt.Success
    });
};

//
//  ### toArray()
//
//  Return an empty array or array with one element on the right
//  of this either.
//
Either.prototype.toArray = function() {
    return this.match({
        Left: constant([]),
        Right: function(x) {
            return [x];
        }
    });
};

//
//  ### toStream()
//
//  Return an empty stream or stream with one element on the right
//  of this either.
//
Attempt.prototype.toStream = function() {
    return this.match({
        Left: Stream.empty,
        Right: Stream.of
    });
};

//
//  ## Left(x)
//
//  Constructor to represent the Left case.
//
Either.Left.prototype.isLeft = true;
Either.Left.prototype.isRight = false;

//
//  ## Right(x)
//
//  Constructor to represent the (biased) Right case.
//
Either.Right.prototype.isLeft = false;
Either.Right.prototype.isRight = true;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Either.Right` with value of `x`.
//
Either.of = function(x) {
    return Either.Right(x);
};

//
//  ## empty()
//
//  Constructor `empty` Monad creating `Either.Left`.
//
Either.Right.empty = function() {
    return Either.Left();
};


//
//  ## isEither(a)
//
//  Returns `true` if `a` is a `Left` or a `Right`.
//
var isEither = isInstanceOf(Either);

squishy = squishy
    .property('Left', Either.Left)
    .property('Right', Either.Right)
    .property('isEither', isEither)
    .method('of', strictEquals(Either), function(x) {
        return Either.of(x);
    })
    .method('empty', strictEquals(Either), function(x) {
        return Either.Left.empty();
    })
    .method('ap', isEither, function(a, b) {
        return a.ap(b);
    })
    .method('arb', strictEquals(Either.Left), function(a, b) {
        return Either.Left(this.arb(AnyVal, b - 1));
    })
    .method('arb', strictEquals(Either.Right), function(a, b) {
        return Either.Right(this.arb(AnyVal, b - 1));
    })
    .method('concat', isEither, function(a, b) {
        return a.concat(b, this.concat);
    })
    .method('equal', isEither, function(a, b) {
        return a.equal(b);
    })
    .method('extract', isEither, function(a) {
        return a.extract();
    })
    .method('flatMap', isEither, function(a, b) {
        return a.flatMap(b);
    })
    .method('map', isEither, function(a, b) {
        return a.map(b);
    })
    .method('toArray', isEither, function(a) {
        return a.toArray();
    })
    .method('toStream', isAttempt, function(a) {
        return a.toStream();
    });
