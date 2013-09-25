//
//  # Identity
//
//  The Identity monad is a monad that does not embody any computational
//  strategy. It simply applies the bound function to its input without
//  any modification.
//
//  * ap(a) - applicative ap(ply)
//  * chain(f) - chain values
//  * `concat(s, plus)` - Semigroup concat
//  * map(f) - functor map
//
//
var Identity = tagged('Identity', ['x']);

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Identity` for the value of `x`.
//
Identity.of = Identity;

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of the identity
//  Applicative ap(ply)
//
Identity.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### concat(b)
//
//  Concatenate two identities associatively together.
//  Semigroup concat
//
Identity.prototype.concat = function(a) {
    var env = this;
    return this.map(function(f) {
        return squishy.concat(env.x, a.x);
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the identity
//  Monadic flatMap/bind
//
Identity.prototype.chain = function(f) {
    return f(this.x);
};

//
//  ### equal(a)
//
//  Compare two option values for equality
//
Identity.prototype.equal = function(b) {
    return squishy.equal(this.x, b.x);
};

//
//  ### map(f)
//
//  Map on the value of this identity.
//  Functor map
//
Identity.prototype.map = function(f) {
    return this.chain(function(a) {
        return Identity.of(f(a));
    });
};

//
//  ### negate(b)
//
//  Negate two identities associatively together.
//
Identity.prototype.negate = function() {
    var env = this;
    return this.map(function(f) {
        return squishy.negate(env.x);
    });
};

//
//  ## isIdentity(a)
//
//  Returns `true` if `a` is `Identity`.
//
var isIdentity = isInstanceOf(Identity);

//
//  ## Identity Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * chain(f) - chain values
//  * map(f) - functor map
//  * ap(a) - applicative ap(ply)
//

var IdentityT = tagged('IdentityT', ['run']);

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
    //  Constructor `empty` Monad creating `IdentityT` for the
    //  value of `M.empty()`.
    //
    Identity.empty = function() {
        return Identity.of(empty(M)());
    };

    //
    //  ### lift(b)
    //
    //  Lift the `Identity` to a new `IdentityT`
    //
    IdentityT.lift = IdentityT;

    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the value of the identity
    //  transformer
    //  Applicative ap(ply)
    //
    IdentityT.prototype.ap = function(a) {
        return this.chain(function(f) {
            return a.map(f);
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
    //  ### equal(b)
    //
    //  Compare two option values for equality
    //
    IdentityT.prototype.equal = function(b) {
        return squishy.equal(this.run, b.run);
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

    return IdentityT;
};

//
//  ## isIdentityT(a)
//
//  Returns `true` if `a` is `IdentityT`.
//
var isIdentityT = isInstanceOf(IdentityT);

//
//  ## identityOf(type)
//
//  Sentinel value for when an identity of a particular type is needed:
//
//       identityOf(Number)
//
function identityOf(type) {
    var self = getInstance(this, identityOf);
    self.type = type;
    return self;
}

//
//  ## isIdentityOf(a)
//
//  Returns `true` if `a` is an instance of `identityOf`.
//
var isIdentityOf = isInstanceOf(identityOf);

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
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Identity.prototype);

//
//  ### lens
//
//  Lens access for an attempt structure.
//
Identity.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return Identity.of(s);
            },
            function() {
                return a.x;
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Identity', Identity)
    .property('IdentityT', Identity.IdentityT)
    .property('identityOf', identityOf)
    .property('identityTOf', identityTOf)
    .property('isIdentity', isIdentity)
    .property('isIdentityOf', isIdentityOf)
    .property('isIdentityT', isIdentityT)
    .property('isIdentityTOf', isIdentityTOf)
    .method('arb', isIdentityOf, function(a, b) {
        return Identity(this.arb(a.type, b - 1));
    })
    .method('ap', isIdentity, function(a, b) {
        return a.ap(b);
    })
    .method('concat', isIdentity, function(a, b) {
        return a.concat(b);
    })
    .method('chain', isIdentity, function(a, b) {
        return a.chain(b);
    })
    .method('empty', strictEquals(Identity), function() {
        return Identity.empty();
    })
    .method('equal', isIdentity, function(a, b) {
        return a.equal(b);
    })
    .method('map', isIdentity, function(a, b) {
        return a.map(b);
    })
    .method('negate', isIdentity, function(a) {
        return a.negate();
    })
    .method('of', strictEquals(Identity), function(x) {
        return Identity.of(x);
    })
    .method('shrink', isIdentity, function(a) {
        return [];
    })
    .method('arb', isIdentityTOf, function(a, b) {
        return Identity.IdentityT(Identity.of(this.arb(a.type, b - 1)));
    })
    .method('ap', isIdentityT, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isIdentityT, function(a, b) {
        return a.chain(b);
    })
    .method('equal', isIdentityT, function(a, b) {
        return a.equal(b);
    })
    .method('map', isIdentityT, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isIdentityT, function(a) {
        return [];
    });
