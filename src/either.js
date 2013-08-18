//
//  # Either
//
//       Either a b = Left a + Right b
//
//  Represents a tagged disjunction between two sets of values; `a` or
//  `b`. Methods are Right-biased.
//
//  * `ap(e)` - Applicative ap(ply)
//  * `concat(s, f)` - Semigroup concat
//  * `flatMap(f)` - Monadic flatMap/bind
//  * `fold(a, b)` - `a` applied to value if `Left`, `b` if `Right`
//  * `map(f)` - Functor map
//  * `swap()` - If this is a Left, then return the Left value in Right or vice versa.
//  * `isLeft` - `true` iff `this` is `Left`
//  * `isRight` - `true` iff `this` is `Right`
//  * `toOption()` - `None` if `Left`, `Some` value of `Right`
//  * `toArray()` - `[]` if `Left`, singleton value if `Right`
//

var Either = taggedSum('Either', {
    Left: ['value'],
    Right: ['value']
});

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

Either.prototype.concat = function(s, f) {
    return this.match({
        Left: function() {
            var Left = this;
            return s.fold(
              constant(Left),
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

Either.prototype.extract = function() {
    return this.match({
        Left: identity,
        Right: identity
    });
};

Either.prototype.flatMap = function(f) {
    return this.match({
        Left: constant(this),
        Right: function(x) {
            return f(x);
        }
    });
};

Either.prototype.fold = function(a, b) {
    return this.match({
        Left: a,
        Right: b
    });
};

Either.prototype.map = function(f) {
    return this.match({
        Left: constant(this),
        Right: function(x) {
            return Either.Right(f(x));
        }
    });
};

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

Either.prototype.toOption = function() {
    return this.match({
        Left: function() {
            return Option.None;
        },
        Right: Option.Some
    });
};

Either.prototype.toAttempt = function() {
    return this.match({
        Left: Attempt.Failure,
        Right: Attempt.Success
    });
};

Either.prototype.toArray = function() {
    return this.match({
        Left: constant([]),
        Right: function(x) {
            return [x];
        }
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
//  ## isEither(a)
//
//  Returns `true` if `a` is a `Left` or a `Right`.
//
var isEither = isInstanceOf(Either);

squishy = squishy
    .property('Left', Either.Left)
    .property('Right', Either.Right)
    .property('isEither', isEither)
    .method('ap', isEither, function(a, b) {
        return a.ap(b);
    })
    .method('arb', isEither, function(a, b) {
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
    });
