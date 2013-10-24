
//
//  ## Attempt Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//  * `ap(a)` - applicative ap(ply)
//  * `equal(a)` - `true` if `a` is equal to `this`
//
var AttemptT = tagged('AttemptT', ['run']);

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of the attempt
//  transformer
//  Applicative ap(ply)
//
AttemptT.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the attempt transformer
//  Monadic flatMap/bind
//
AttemptT.prototype.chain = function(f) {
    return AttemptT(this.run.chain(function(x) {
        return f(x).run;
    }));
};

//
//  ### map(f)
//
//  Map on the value of this attempt.
//  Functor map
//
AttemptT.prototype.map = function(f) {
    return this.chain(function(a) {
        return AttemptT.of(f(a));
    });
};

Attempt.AttemptT = function(M) {

    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `AttemptT` for the value of `x`.
    //
    AttemptT.of = function(a) {
        return AttemptT(point(M)(a));
    };

    //
    //  ## empty()
    //
    //  ConstruAttemptT `empty` Monad creating `AttemptT` for the
    //  value of `M.empty()`.
    //
    AttemptT.empty = function() {
        return AttemptT(zero(M)());
    };

    //
    //  ### lift(b)
    //
    //  Lift the `AttemptT` to a new `AttemptT`
    //
    AttemptT.lift = AttemptT;

    return AttemptT;
};

//
//  ## isAttemptT(a)
//
//  Returns `true` if `a` is `AttemptT`.
//
var isAttemptT = isInstanceOf(AttemptT);

//
//  ## attemptTOf(type)
//
//  Sentinel value for when an attempt of a particular type is needed:
//
//       attemptTOf(Number)
//
function attemptTOf(type) {
    var self = getInstance(this, attemptTOf);
    self.type = type;
    return self;
}

//
//  ## isAttemptTOf(a)
//
//  Returns `true` if `a` is an instance of `attemptTOf`.
//
var isAttemptTOf = isInstanceOf(attemptTOf);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('AttemptT', Attempt.AttemptT)
    .property('attemptTOf', attemptTOf)
    .property('isAttemptT', isAttemptT)
    .property('isAttemptTOf', isAttemptTOf)
    .method('of', strictEquals(AttemptT), function(a, b, c) {
        return Attempt.AttemptT(b).of(c);
    })
    .method('empty', strictEquals(AttemptT), function(a, b) {
        return Attempt.AttemptT(b).empty();
    })
    .method('arb', isAttemptTOf, function(a, b) {
        return Attempt.AttemptT(this.arb(a.type, b - 1));
    })
    .method('ap', isAttemptT, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isAttemptT, function(a, b) {
        return a.chain(b);
    })
    .method('map', isAttemptT, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isAttemptT, function(a) {
        return [];
    });
