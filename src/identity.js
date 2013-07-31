//
//  # Identity
//
//  The Identity monad is a monad that does not embody any computational
//  strategy. It simply applies the bound function to its input without
//  any modification.
//
//  * chain(f) - chain values
//  * map(f) - functor map
//  * ap(a) - applicative ap(ply)
//
//
var Identity = tagged('Identity', ['x']);

Identity.of = Identity;

Identity.prototype.chain = function(f) {
    return f(this.x);
};

Identity.prototype.map = function(f) {
    return this.chain(function(a) {
        return Identity.of(f(a));
    });
};

Identity.prototype.ap = function(a) {
    return this.chain(function(f) {
        return a.map(f);
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
Identity.IdentityT = function(M) {

    var IdentityT = tagged('IdentityT', ['run']);

    IdentityT.of = function(a) {
        return IdentityT(M.of(a));
    };

    IdentityT.lift = IdentityT;

    IdentityT.prototype.chain = function(f) {
        return IdentityT(this.run.chain(function(x) {
            return f(x).run;
        }));
    };

    IdentityT.prototype.map = function(f) {
        return this.chain(function(a) {
            return IdentityT.of(f(a));
        });
    };

    IdentityT.prototype.ap = function(a) {
        return this.chain(function(f) {
            return a.map(f);
        });
    };

    return IdentityT;
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Identity', Identity)
    .property('isIdentity', isIdentity)
    .property('IdentityT', Identity.IdentityT)
    .method('map', isIdentity, function(a, b) {
        return a.map(b);
    })
    .method('ap', isIdentity, function(a, b) {
        return a.ap(b);
    });
