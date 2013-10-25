//
//  # Identity
//
//  The Identity monad is a monad that does not embody any computational
//  strategy. It simply applies the bound function to its input without
//  any modification.
//
//   * `ap(a)` - applicative ap(ply)
//   * `chain(f)` - chain values
//   * `concat(s, plus)` - Semigroup concat
//   * `map(f)` - functor map
//   * `toArray()` - `[x]` if `Identity(x)`
//
var Identity = tagged('Identity', ['x']);

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Identity` for the value of `x`.
//
Identity.of = Identity;

//
//  ## empty()
//
//  Constructor `empty` Monad creating `Identity`.
//
Identity.empty = function() {
    return Identity(null);
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of the `Identity`
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
    return this.map(function(x) {
        return squishy.concat(x, a.x);
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the `Identity`
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
//  Map on the value of this `Identity`.
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
//  ## identityOf(type)
//
//  Sentinel value for when an `Identity` of a particular type is needed:
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
    .property('identityOf', identityOf)
    .property('isIdentity', isIdentity)
    .property('isIdentityOf', isIdentityOf)
    .method('of', strictEquals(Identity), function(x, y) {
        return Identity.of(y);
    })
    .method('empty', strictEquals(Identity), function(x) {
        return Identity.empty();
    })
    .method('arb', isIdentityOf, function(a, b) {
        return Identity(this.arb(a.type, b - 1));
    })
    .method('concat', isIdentity, function(a, b) {
        return a.concat(b);
    })
    .method('negate', isIdentity, function(a) {
        return a.negate();
    })
    .method('toArray', isIdentity, function(a) {
        return a.toArray();
    })
    .method('ap', isIdentity, function(a, b) {
        return a.ap(b);
    })
    .method('equal', isIdentity, function(a, b) {
        return a.equal(b);
    })
    .method('chain', isIdentity, function(a, b) {
        return a.chain(b);
    })
    .method('map', isIdentity, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isIdentity, function(a) {
        return [];
    });
