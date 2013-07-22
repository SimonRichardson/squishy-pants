//
//   # Option
//
//       Option a = Some a + None
//
//   The option type encodes the presence and absence of a value. The
//   `some` constructor represents a value and `none` represents the
//   absence.
//
var Option = taggedSum('Option', {
    some: ['value'],
    none: []
});

Option.prototype.ap = function(b) {
    return this.match({
        some: function(x) {
            return b.map(x);
        },
        none: function() {
            return this;
        }
    });
};

Option.prototype.concat = function(s, f) {
    return this.match({
        some: function(x) {
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
        some: f,
        none: function() {
            return this;
        }
    });
};

Option.prototype.fold = function(f, g) {
    return this.match({
        some: f,
        none: g
    });
};

Option.prototype.getOrElse = function(x) {
    return this.match({
        some: identity,
        none: function() {
            return x;
        }
    });
};

Option.prototype.map = function(f) {
    return this.match({
        some: function(x) {
            return Option.some(f(x));
        },
        none: function() {
            return this;
        }
    });
};

Option.prototype.toAttempt = function(f) {
    return this.match({
        some: Attempt.success,
        none: function() {
            return Attempt.failure(squishy.empty(Array));
        }
    });
};

Option.prototype.toLeft = function(o) {
    return this.match({
        some: Either.left,
        none: Either.right
    });
};

Option.prototype.toRight = function(o) {
    return this.match({
        some: Either.left,
        none: Either.right
    });
};

Option.prototype.toArray = function() {
    return this.match({
        some: function(x) {
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
    return Option.some(x);
};

//
//  ## some(x)
//
//  Constructor to represent the existence of a value, `x`.
//
Option.some.prototype.isSome = true;
Option.some.prototype.isNone = false;

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
//  Returns `true` if `a` is a `some` or `none`.
//
var isOption = isInstanceOf(Option);

squishy = squishy
    .property('some', Option.some)
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
