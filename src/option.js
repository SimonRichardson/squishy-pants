//
//   # Option
//
//       Option a = Some a + None
//
//   The option type encodes the presence and absence of a value. The
//   `Some` constructor represents a value and `None` represents the
//   absence.
//
//   * `ap(s)` - Applicative ap(ply)
//   * `concat(s, plus)` - Semigroup concat
//   * `flatMap(f)` - Monadic flatMap/bind
//   * `fold(a, b)` - Applies `a` to value if `Some` or defaults to `b`
//   * `getOrElse(a)` - Default value for `None`
//   * `map(f)` - Functor map
//   * `isSome` - `true` if `this` is `Some`
//   * `isNone` - `true` if `this` is `None`
//   * `toAttempt(r)` - `Success(x)` if `Some(x)`, `Failure(r)` if None
//   * `toLeft(r)` - `Left(x)` if `Some(x)`, `Right(r)` if None
//   * `toRight(l)` - `Right(x)` if `Some(x)`, `Left(l)` if None
//

var Option = taggedSum('Option', {
    Some: ['value'],
    None: []
});

Option.prototype.ap = function(b) {
    return this.match({
        Some: function(x) {
            return b.map(x);
        },
        None: function() {
            return this;
        }
    });
};

Option.prototype.concat = function(s, f) {
    return this.match({
        Some: function(x) {
            return s.map(function(y) {
                return f(x, y);
            });
        },
        None: function() {
            return this;
        }
    });
};

Option.prototype.flatMap = function(f) {
    return this.match({
        Some: f,
        None: function() {
            return this;
        }
    });
};

Option.prototype.fold = function(f, g) {
    return this.match({
        Some: f,
        None: g
    });
};

Option.prototype.getOrElse = function(x) {
    return this.match({
        Some: identity,
        None: function() {
            return x;
        }
    });
};

Option.prototype.map = function(f) {
    return this.match({
        Some: function(x) {
            return Option.Some(f(x));
        },
        None: function() {
            return this;
        }
    });
};

Option.prototype.toAttempt = function() {
    return this.match({
        Some: Attempt.Success,
        None: function() {
            return Attempt.Failure(squishy.empty(Array));
        }
    });
};

Option.prototype.toLeft = function(o) {
    return this.match({
        Some: Either.Left,
        None: Either.Right
    });
};

Option.prototype.toRight = function(o) {
    return this.match({
        Some: Either.Left,
        None: Either.Right
    });
};

Option.prototype.toArray = function() {
    return this.match({
        Some: function(x) {
            return [x];
        },
        None: function() {
            return [];
        }
    });
};

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Option` with value of `x`.
//
Option.of = function(x) {
    return Option.Some(x);
};

//
//  ## Some(x)
//
//  Constructor to represent the existence of a value, `x`.
//
Option.Some.prototype.isSome = true;
Option.Some.prototype.isNone = false;

//
//  ## None
//
//  Represents the absence of a value.
//
Option.None.isSome = false;
Option.None.isNone = true;

//
//  ## isOption(a)
//
//  Returns `true` if `a` is a `Some` or `None`.
//
var isOption = isInstanceOf(Option);

squishy = squishy
    .property('Some', Option.Some)
    .property('None', Option.None)
    .property('isOption', isOption)
    .method('ap', isOption, function(a, b) {
        return a.ap(b);
    })
    .method('concat', isOption, function(a, b) {
        return a.concat(b, this.concat);
    })
    .method('flatMap', isOption, function(a, b) {
        return a.flatMap(b);
    })
    .method('fold', isOption, function(a, b, c) {
        return a.fold(b, c);
    })
    .method('map', isOption, function(a, b) {
        return a.map(b);
    })
    .method('arb', isOption, function(a, b) {
        return Option.Some(this.arb(AnyVal, b - 1));
    })
    .method('toArray', isOption, function(a) {
        return a.toArray();
    });
