//
//  # Either
//
//       Either a b = Left a + Right b
//
//  Represents a tagged disjunction between two sets of values; `a` or
//  `b`. Methods are right-biased.
//
//  * `ap(e)` - Applicative ap(ply)
//  * `concat(s, f)` - Semigroup concat
//  * `flatMap(f)` - Monadic flatMap/bind
//  * `fold(a, b)` - `a` applied to value if `left`, `b` if `right`
//  * `map(f)` - Functor map
//  * `swap()` - If this is a Left, then return the left value in Right or vice versa.
//  * `isLeft` - `true` iff `this` is `left`
//  * `isRight` - `true` iff `this` is `right`
//  * `toOption()` - `none` if `left`, `Some` value of `right`
//  * `toArray()` - `[]` if `left`, singleton value if `right`
//

var Either = taggedSum('Either', {
    left: ['value'],
    right: ['value']
});

Either.prototype.ap = function(e) {
    return this.match({
        left: function() {
            return this;
        },
        right: function(x) {
            return e.map(x);
        }
    });
};

Either.prototype.concat = function(s, f) {
    return this.match({
        left: function() {
            var left = this;
            return s.fold(
              constant(left),
              constant(s)
            );
        },
        right: function(y) {
            return s.map(function(x) {
                return f(x, y);
            });
        }
    });
};

Either.prototype.flatMap = function(f) {
    return this.match({
        left: function() {
            return this;
        },
        right: function(x) {
            return f(x);
        }
    });
};

Either.prototype.fold = function(a, b) {
    return this.match({
        left: a,
        right: b
    });
};

Either.prototype.map = function(f) {
    return this.match({
        left: function() {
            return this;
        },
        right: function(x) {
            return Either.right(f(x));
        }
    });
};

Either.prototype.swap = function() {
    return this.match({
        left: function(x) {
            return Either.right(x);
        },
        right: function(x) {
            return Either.left(x);
        }
    });
};

Either.prototype.toOption = function() {
    return this.match({
        left: function() {
            return Option.none;
        },
        right: Option.Some
    });
};

Either.prototype.toAttempt = function() {
    return this.match({
        left: Attempt.failure,
        right: Attempt.success
    });
};

Either.prototype.toArray = function() {
    return this.match({
        left: function(x) {
            return [];
        },
        right: function(x) {
            return [x];
        }
    });
};

//
//  ## left(x)
//
//  Constructor to represent the left case.
//
Either.left.prototype.isLeft = true;
Either.left.prototype.isRight = false;

//
//  ## right(x)
//
//  Constructor to represent the (biased) right case.
//
Either.right.prototype.isLeft = false;
Either.right.prototype.isRight = true;

//
//  ## isEither(a)
//
//  Returns `true` if `a` is a `left` or a `right`.
//
var isEither = isInstanceOf(Either);

squishy = squishy
    .property('left', Either.left)
    .property('right', Either.right)
    .property('isEither', isEither)
    .method('flatMap', isEither, function(a, b) {
        return a.flatMap(b);
    })
    .method('map', isEither, function(a, b) {
        return a.map(b);
    })
    .method('ap', isEither, function(a, b) {
        return a.ap(b);
    })
    .method('concat', isEither, function(a, b) {
        return a.concat(b, this.concat);
    })
    .method('toArray', isEither, function(a) {
        return a.toArray();
    });
