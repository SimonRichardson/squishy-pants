//
//   # Either
//
//        Either a b = Left a + Right b
//
//   Represents a tagged disjunction between two sets of values; `a` or
//   `b`. Methods are Right-biased.
//
//   * `ap(e)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `concat(s, f)` - Semigroup concat
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
    var env = this;
    return env.match({
        Left: constant(env),
        Right: function(x) {
            return squishy.map(e, x);
        }
    });
};

//
//  ### chain(f)
//
//  Bind through the success of the either
//  Monadic flatMap/bind
//
Either.prototype.chain = function(f) {
    var env = this;
    return env.match({
        Left: constant(env),
        Right: f
    });
};

//
//  ### concat(s, f)
//
//  Concatenate two eithers associatively together.
//  Semigroup concat
//
Either.prototype.concat = function(s) {
    var env = this;
    return env.match({
        Left: function() {
            return squishy.fold(
                s,
                constant(env),
                constant(s)
            );
        },
        Right: function(y) {
            return squishy.map(s, function(x) {
                return squishy.concat(x, y);
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
    var env = this;
    return env.match({
        Left: constant(env),
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
//  Return an empty array for a `Left` `Either`.
//
Either.Left.prototype.toArray = function() {
    return [];
};

//
//  ### toStream()
//
//  Return an empty stream or stream with one element on the right
//  of this either.
//
Either.prototype.toStream = function() {
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
Either.empty = function() {
    return Either.Left([]);
};


//
//  ## isEither(a)
//
//  Returns `true` if `a` is a `Left` or a `Right`.
//
var isEither = isInstanceOf(Either);

//
//  ## Either Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//  * `ap(a)` - applicative ap(ply)
//  * `equal(a)` - `true` if `a` is equal to `this`
//
var EitherT = tagged('EitherT', ['run']);

Either.EitherT = transformer(EitherT);

//
//  ## isEitherT(a)
//
//  Returns `true` if `a` is `EitherT`.
//
var isEitherT = isInstanceOf(EitherT);

//
//  ## leftOf(type)
//
//  Sentinel value for when an left of a particular type is needed:
//
//       leftOf(Number)
//
function leftOf(type) {
    var self = getInstance(this, leftOf);
    self.type = type;
    return self;
}

//
//  ## isLeftOf(a)
//
//  Returns `true` if `a` is an instance of `leftOf`.
//
var isLeftOf = isInstanceOf(leftOf);

//
//  ## rightOf(type)
//
//  Sentinel value for when an right of a particular type is needed:
//
//       rightOf(Number)
//
function rightOf(type) {
    var self = getInstance(this, rightOf);
    self.type = type;
    return self;
}

//
//  ## isRightOf(a)
//
//  Returns `true` if `a` is an instance of `rightOf`.
//
var isRightOf = isInstanceOf(rightOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Either.prototype);

//
//  ## eitherTOf(type)
//
//  Sentinel value for when an either of a particular type is needed:
//
//       eitherTOf(Number)
//
function eitherTOf(type) {
    var self = getInstance(this, eitherTOf);
    self.type = type;
    return self;
}

//
//  ## isEitherTOf(a)
//
//  Returns `true` if `a` is an instance of `eitherTOf`.
//
var isEitherTOf = isInstanceOf(eitherTOf);

//
//  ### lens
//
//  Lens access for an attempt structure.
//
Either.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return a.match({
                    Left: function() {
                        return Either.Left(s);
                    },
                    Right: function() {
                        return Either.Right(s);
                    }
                });
            },
            function() {
                return a.match({
                    Left: identity,
                    Right: identity
                });
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Either', Either)
    .property('EitherT', EitherT)
    .property('Left', Either.Left)
    .property('Right', Either.Right)
    .property('leftOf', leftOf)
    .property('rightOf', rightOf)
    .property('eitherTOf', eitherTOf)
    .property('isEither', isEither)
    .property('isEitherT', isEitherT)
    .property('isLeftOf', isLeftOf)
    .property('isRightOf', isRightOf)
    .property('isEitherTOf', isEitherTOf)
    .method('of', strictEquals(Either), function(x, y) {
        return Either.of(y);
    })
    .method('empty', strictEquals(Either), function(x) {
        return Either.empty();
    })

    .method('arb', isLeftOf, function(a, b) {
        return Either.Left(this.arb(a.type, b - 1));
    })
    .method('arb', isRightOf, function(a, b) {
        return Either.Right(this.arb(a.type, b - 1));
    })
    .method('arb', isEitherTOf, function(a, b) {
        return Either.EitherT(Either.of(this.arb(a.type, b - 1)));
    })

    .method('concat', isEither, function(a, b) {
        return a.concat(b);
    })
    .method('extract', isEither, function(a) {
        return a.extract();
    })
    .method('fold', isEither, function(a, b, c) {
        return a.fold(b, c);
    })
    .method('toArray', isEither, function(a) {
        return a.toArray();
    })
    .method('toStream', isEither, function(a) {
        return a.toStream();
    })

    .method('ap', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
        return a.ap(b);
    })
    .method('chain', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
        return a.chain(b);
    })
    .method('equal', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
        return a.equal(b);
    })
    .method('map', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
        return a.map(b);
    })
    .method('shrink', squishy.liftA2(or, isEither, isEitherT), function(a) {
        return [];
    });
