//
//  ## Generic Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//  * `ap(a)` - applicative ap(ply)
//  * `equal(a)` - `true` if `a` is equal to `this`
//

var transformer = function(ctor) {

    return function(M) {

        //
        //  ## of(x)
        //
        //  Constructor `of` Monad creating `ctor` for the value of `x`.
        //
        ctor.of = function(a) {
            return ctor(point(M)(a));
        };

        //
        //  ## empty()
        //
        //  Constructor `empty` Monad creating `ctor` for the
        //  value of `M.empty()`.
        //
        ctor.empty = function() {
            return ctor(zero(M)());
        };

        //
        //  ### lift(b)
        //
        //  Lift the `ctor` to a new `ctor`
        //
        ctor.lift = ctor;

        //
        //  ### ap(b)
        //
        //  Apply a function in the environment of the value of the identity
        //  transformer
        //  Applicative ap(ply)
        //
        ctor.prototype.ap = function(a) {
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
        ctor.prototype.chain = function(f) {
            return ctor(this.run.chain(function(x) {
                return f(x).run;
            }));
        };


        //
        //  ### equal(b)
        //
        //  Compare two option values for equality
        //
        ctor.prototype.equal = function(b) {
            return squishy.equal(this.run, b.run);
        };


        //
        //  ### map(f)
        //
        //  Map on the value of this identity.
        //  Functor map
        //
        ctor.prototype.map = function(f) {
            return this.chain(function(a) {
                return ctor.of(f(a));
            });
        };


        return ctor;
    };
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('transformer', transformer);
