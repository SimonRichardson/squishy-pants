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
//   * `chain(f)` - Monadic flatMap/bind
//   * `concat(s, plus)` - Semigroup concat
//   * `equal(a)` -  `true` if `a` is equal to `this`
//   * `extract()` -  extract the value from `Option`
//   * `fold(a, b)` - Applies `a` to value if `Some` or defaults to `b`
//   * `get()` - get the value from `Option`
//   * `getOrElse(a)` - Default value for `None`
//   * `map(f)` - Functor map
//   * `isSome` - `true` if `this` is `Some`
//   * `isNone` - `true` if `this` is `None`
//   * `toAttempt(r)` - `Success(x)` if `Some(x)`, `Failure(r)` if `None`
//   * `toArray()` - `[x]` if `Some(x)`, `[]` if `None`
//   * `toStream()` - `Stream.of(x)` if `Some(x)`, `Stream.empty()` if `None`
//   * `toLeft(r)` - `Left(x)` if `Some(x)`, `Right(r)` if None
//   * `toRight(l)` - `Right(x)` if `Some(x)`, `Left(l)` if None
//
var Option = taggedSum('Option', {
    Some: ['value'],
    None: []
});

//
//  ### toOption(a)
//
Option.toOption = function(a, f) {
    return f(a) ? Option.Some(a) : Option.None;
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the `Some` of this `Option`,
//  accumulating errors
//  Applicative ap(ply)
//
Option.prototype.ap = function(a) {
    return this.chain(
        function(f) {
            return squishy.map(a, f);
        }
    );
};

//
//  ### chain(f)
//
//  Bind through the success of the `Option`
//  Monadic flatMap/bind
//
Option.prototype.chain = function(f) {
    return this.match({
        Some: f,
        None: constant(this)
    });
};

//
//  ### concat(s, f)
//
//  Concatenate two `Option`s associatively together.
//  Semigroup concat
//
Option.prototype.concat = function(s) {
    return this.match({
        Some: function(x) {
            return squishy.map(
                s,
                function(y) {
                    return squishy.concat(x, y);
                }
            );
        },
        None: constant(this)
    });
};

//
//  ### equal(a)
//
//  Compare two `Option` values for equality
//
Option.prototype.equal = function(a) {
    return this.match({
        Some: function(x) {
            return a.match({
                Some: function(y) {
                    return squishy.equal(x, y);
                },
                None: constant(false)
            });
        },
        None: function() {
            return a.match({
                Some: constant(false),
                None: constant(true)
            });
        }
    });
};

//
//  ### extract()
//
//  Extract the value from the `Option`.
//
Option.prototype.extract = function() {
    return this.match({
        Some: identity,
        None: constant(null)
    });
};

//
//  ### fold(a, b)
//
//  Catamorphism. Run the first given function if failure, otherwise,
//  the second given function.
//   `a` applied to value if `Some`, `b` if `None`
//
Option.prototype.fold = function(f, g) {
    return this.match({
        Some: f,
        None: g
    });
};

//
//  ### get()
//
//  Get the value from the `Option`.
//
Option.prototype.get = function() {
    return this.match({
        Some: identity,
        None: error('Unexpected value')
    });
};

//
//  ### get()
//
//  Get the value from the `Option` or else
//
Option.prototype.getOrElse = function(x) {
    return this.match({
        Some: identity,
        None: constant(x)
    });
};

//
//  ### map(f)
//
//  Map on the `Some` of this `Option`.
//  Functor map
//
Option.prototype.map = function(f) {
    return this.chain(
        function(a) {
            return Option.of(f(a));
        }
    );
};

//
//  ### traverse(f, p)
//
//  Traverse the `Option` when finding a `None` `Option` return point.
//
Option.prototype.traverse = function(f, p) {
    return this.match({
        Some: function(x) {
            return Option.Some(f(x));
        },
        None: function() {
            return squishy.of(p, Option.None);
        }
    });
};

//
//  ### toAttempt()
//
//  Return failure if `Option` is a `Some` and success if `Option` is `None`.
//  `None` if `Failure(x)`, `Some(x)` if `Success(e)`
//
Option.prototype.toAttempt = function() {
    return this.match({
        Some: Attempt.Success,
        None: Attempt.empty
    });
};

//
//  ### toLeft()
//
//  Return an left either bias if `Option` is a `Some`.
//  `Left(x)` if `Some(x)`, `Right(x)` if `None`
//
Option.prototype.toLeft = function() {
    return this.match({
        Some: Either.Left,
        None: function() {
            return Either.Right([]);
        }
    });
};

//
//  ### toRight()
//
//  Return an right either bias if `Option` is a `Some`.
//  `Right(x)` if `Some(x)`, `Left(x)` if `None`
//
Option.prototype.toRight = function() {
    return this.match({
        Some: Either.Right,
        None: function() {
            return Either.Left([]);
        }
    });
};

//
//  ### toStream()
//
//  Return an empty stream or stream with one element on the right
//  of this either.
//
Option.prototype.toStream = function() {
    return this.match({
        Some: Stream.of,
        None: Stream.empty
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
//  ## empty()
//
//  Constructor `empty` Monad creating `Option` with no value.
//
Option.empty = function() {
    return Option.None;
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

//
//  ## someOf(type)
//
//  Sentinel value for when an `Some` of a particular type is needed:
//
//       someOf(Number)
//
function someOf(type) {
    var self = getInstance(this, someOf);
    self.type = type;
    return self;
}

//
//  ## isSomeOf(a)
//
//  Returns `true` if `a` is an instance of `someOf`.
//
var isSomeOf = isInstanceOf(someOf);

//
//  ## noneOf()
//
//  Sentinel value for when an `None` is needed:
//
//       noneOf()
//
function noneOf() {
    var self = getInstance(this, noneOf);
    return self;
}

//
//  ## isNoneOf(a)
//
//  Returns `true` if `a` is an instance of `noneOf`.
//
var isNoneOf = isInstanceOf(noneOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Option.prototype);

//
//  ### lens
//
//  Lens access for an option structure.
//
Option.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return a.match({
                    Some: function() {
                        return Option.Some(s);
                    },
                    None: constant(Option.None)
                });
            },
            function() {
                return a.match({
                    Some: identity,
                    None: constant(null)
                });
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Option', Option)
    .property('Some', Option.Some)
    .property('None', Option.None)
    .property('someOf', someOf)
    .property('noneOf', noneOf)
    .property('isOption', isOption)
    .property('isSomeOf', isSomeOf)
    .property('isNoneOf', isNoneOf)
    .property('toOption', Option.toOption)
    .method('of', strictEquals(Option), function(x, y) {
        return Option.of(y);
    })
    .method('empty', strictEquals(Option), function(x) {
        return Option.empty();
    })
    .method('arb', isSomeOf, function(a, b) {
        return Option.Some(this.arb(a.type, b - 1));
    })
    .method('arb', isNoneOf, function(a, b) {
        return Option.None;
    })
    .method('ap', isOption, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isOption, function(a, b) {
        return a.chain(b);
    })
    .method('concat', isOption, function(a, b) {
        return a.concat(b);
    })
    .method('equal', isOption, function(a, b) {
        return a.equal(b);
    })
    .method('extract', isOption, function(a) {
        return a.extract();
    })
    .method('fold', isOption, function(a, b, c) {
        return a.fold(b, c);
    })
    .method('map', isOption, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isOption, function(a) {
        return [];
    })
    .method('toArray', isOption, function(a) {
        return a.toArray();
    })
    .method('toStream', isOption, function(a) {
        return a.toStream();
    });
