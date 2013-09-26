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
        Identity.empty = function() {
            return ctor(empty(M)());
        };

        //
        //  ### lift(b)
        //
        //  Lift the `Identity` to a new `ctor`
        //
        ctor.lift = ctor;

        //
        //  ### ap(b)
        //
        //  Apply a function in the environment of the value of the identity
        //  transformer
        //  Applicative ap(ply)
        //
        if (isFunction(hasMethod(M, 'ap'))) {
            ctor.prototype.ap = function(a) {
                return ctor(this.run.ap(a.run));
            };
        }

        //
        //  ### chain(f)
        //
        //  Bind through the value of the identity transformer
        //  Monadic flatMap/bind
        //
        if (isFunction(hasMethod(M, 'chain'))) {
            ctor.prototype.chain = function(f) {
                return ctor(this.run.chain(function(x) {
                    return f(x).run;
                }));
            };
        }

        //
        //  ### equal(b)
        //
        //  Compare two option values for equality
        //
        if (isFunction(hasMethod(M, 'equal'))) {
            ctor.prototype.equal = function(b) {
                return squishy.equal(this.run, b.run);
            };
        }

        //
        //  ### map(f)
        //
        //  Map on the value of this identity.
        //  Functor map
        //
        if (isFunction(hasMethod(M, 'map'))) {
            ctor.prototype.map = function(f) {
                return ctor(this.run.map(f));
            };
        }

        return ctor;
    };
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('transformer', transformer);
