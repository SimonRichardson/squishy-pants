//
//   # Option
//
//       Option a = Some a + None
//
//   The option type encodes the presence and absence of a value. The
//   `Some` constructor represents a value and `none` represents the
//   absence.
//
//   * `ap(s)` - Applicative ap(ply)
//   * `concat(s, plus)` - Semigroup concat
//   * `flatMap(f)` - Monadic flatMap/bind
//   * `fold(a, b)` - Applies `a` to value if `Some` or defaults to `b`
//   * `getOrElse(a)` - Default value for `none`
//   * `map(f)` - Functor map
//   * `isSome` - `true` if `this` is `Some`
//   * `isNone` - `true` if `this` is `none`
//   * `toAttempt(r)` - `success(x)` if `Some(x)`, `failure(r)` if none
//   * `toLeft(r)` - `left(x)` if `Some(x)`, `right(r)` if none
//   * `toRight(l)` - `right(x)` if `Some(x)`, `left(l)` if none
//

var Option = taggedSum('Option', {
    Some: ['value'],
    none: []
});

Option.prototype.ap = function(b) {
    return this.match({
        Some: function(x) {
            return b.map(x);
        },
        none: function() {
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
        none: function() {
            return this;
        }
    });
};

Option.prototype.flatMap = function(f) {
    return this.match({
        Some: f,
        none: function() {
            return this;
        }
    });
};

Option.prototype.fold = function(f, g) {
    return this.match({
        Some: f,
        none: g
    });
};

Option.prototype.getOrElse = function(x) {
    return this.match({
        Some: identity,
        none: function() {
            return x;
        }
    });
};

Option.prototype.map = function(f) {
    return this.match({
        Some: function(x) {
            return Option.Some(f(x));
        },
        none: function() {
            return this;
        }
    });
};

Option.prototype.toAttempt = function() {
    return this.match({
        Some: Attempt.success,
        none: function() {
            return Attempt.failure(squishy.empty(Array));
        }
    });
};

Option.prototype.toLeft = function(o) {
    return this.match({
        Some: Either.left,
        none: Either.right
    });
};

Option.prototype.toRight = function(o) {
    return this.match({
        Some: Either.left,
        none: Either.right
    });
};

Option.prototype.toArray = function() {
    return this.match({
        Some: function(x) {
            return [x];
        },
        none: function() {
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
//  ## none
//
//  Represents the absence of a value.
//
Option.none.isSome = false;
Option.none.isNone = true;

//
//  ## isOption(a)
//
//  Returns `true` if `a` is a `Some` or `none`.
//
var isOption = isInstanceOf(Option);

squishy = squishy
    .property('Some', Option.Some)
    .property('none', Option.none)
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
    .method('toArray', isOption, function(a) {
        return a.toArray();
    });
