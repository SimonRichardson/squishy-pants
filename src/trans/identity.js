//
//  ## Identity Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//  * `ap(a)` - applicative ap(ply)
//  * `equal(a)` - `true` if `a` is equal to `this`
//
var IdentityT = tagged('IdentityT', ['run']);

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of the identity
//  transformer
//  Applicative ap(ply)
//
IdentityT.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the identity transformer
//  Monadic flatMap/bind
//
IdentityT.prototype.chain = function(f) {
    return IdentityT(this.run.chain(function(x) {
        return f(x).run;
    }));
};

//
//  ### map(f)
//
//  Map on the value of this identity.
//  Functor map
//
IdentityT.prototype.map = function(f) {
    return this.chain(function(a) {
        return IdentityT.of(f(a));
    });
};

Identity.IdentityT = function(M) {

    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `IdentityT` for the value of `x`.
    //
    IdentityT.of = function(a) {
        return IdentityT(point(M)(a));
    };

    //
    //  ## empty()
    //
    //  ConstruIdentityT `empty` Monad creating `IdentityT` for the
    //  value of `M.empty()`.
    //
    IdentityT.empty = function() {
        return IdentityT(zero(M)());
    };

    //
    //  ### lift(b)
    //
    //  Lift the `IdentityT` to a new `IdentityT`
    //
    IdentityT.lift = IdentityT;

    return IdentityT;
};

//
//  ## isIdentityT(a)
//
//  Returns `true` if `a` is `IdentityT`.
//
var isIdentityT = isInstanceOf(IdentityT);

//
//  ## identityTOf(type)
//
//  Sentinel value for when an identity of a particular type is needed:
//
//       identityTOf(Number)
//
function identityTOf(type) {
    var self = getInstance(this, identityTOf);
    self.type = type;
    return self;
}

//
//  ## isIdentityTOf(a)
//
//  Returns `true` if `a` is an instance of `identityTOf`.
//
var isIdentityTOf = isInstanceOf(identityTOf);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('IdentityT', Identity.IdentityT)
    .property('identityTOf', identityTOf)
    .property('isIdentityT', isIdentityT)
    .property('isIdentityTOf', isIdentityTOf)
    .method('of', strictEquals(IdentityT), function(a, b, c) {
        return Identity.IdentityT(b).of(c);
    })
    .method('empty', strictEquals(IdentityT), function(a, b) {
        return Identity.IdentityT(b).empty();
    })
    .method('arb', isIdentityTOf, function(a, b) {
        return Identity.IdentityT(this.arb(a.type, b - 1));
    })
    .method('ap', isIdentityT, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isIdentityT, function(a, b) {
        return a.chain(b);
    })
    .method('map', isIdentityT, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isIdentityT, function(a) {
        return [];
    });
