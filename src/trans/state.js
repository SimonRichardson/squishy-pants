//
//  ## State Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - function map
//  * `ap(a)` - applicative ap(ply)
//
var StateT = tagged('StateT', ['run']);

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of the state
//  transformer
//  Applicative ap(ply)
//
StateT.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the state transformer
//  Monadic flatMap/bind
//
StateT.prototype.chain = function(f) {
    var env = this;
    return StateT(function(a) {
        var result = env.run(a);
        return result.chain(function(b) {
            return f(b._1).run(b._2);
        });
    });
};

//
//  ### evalState(s)
//
//  Evaluate the `StateT` with `s`.
//
StateT.prototype.evalState = function(s) {
    return this.run(s).map(function(t) {
        return t._1;
    });
};

//
//  ### execState(s)
//
//  Execute the `StateT` with `s`.
//
StateT.prototype.execState = function(s) {
    return this.run(s).map(function(t) {
        return t._2;
    });
};

//
//  ### map(f)
//
//  Map on the value of this state.
//  Functor map
//
StateT.prototype.map = function(f) {
    return this.chain(function(a) {
        return StateT.of(f(a));
    });
};

//
//  ## StateT(m)
//
//  `StateT` constructor passing in a monad type.
//
State.StateT = function(monad) {

    //
    //  ## get()
    //
    //  Construct `get` to retrieve the `StateT` value.
    //
    StateT.get = StateT(function(s) {
        return monad.of(Tuple2(s, s));
    });

    //
    //  ## lift(m)
    //
    //  Construct `lift` Monad creating a `StateT`.
    //
    StateT.lift = function(m) {
        return StateT(function(b) {
            return m.map(function(c) {
                return Tuple2(c, b);
            });
        });
    };

    //
    //  ## modify(f)
    //
    //  Construct `modify` to alter the `StateT` value using the function.
    //
    StateT.modify = function(f) {
        return StateT(function(s) {
            return monad.of(Tuple2(null, f(s)));
        });
    };

    //
    //  ## of(x)
    //
    //  Construct `of` Monad creating a `StateT`.
    //
    StateT.of = function(a) {
        return StateT(function(b) {
            return monad.of(Tuple2(a, b));
        });
    };

    //
    //  ## put(s)
    //
    //  Construct `put` to return the value of s.
    //
    StateT.put = function(s) {
        return StateT.modify(function(a) {
            return s;
        });
    };

    return StateT;
};

//
//  ## isStateT(a)
//
//  Returns `true` if `a` is `StateT`.
//
var isStateT = isInstanceOf(StateT);

//
//  ## stateTOf(type)
//
//  Sentinel value for when an state of a particular type is needed:
//
//       stateTOf(Number)
//
function stateTOf(type) {
    var self = getInstance(this, stateTOf);
    self.type = type;
    return self;
}

//
//  ## isStateOf(a)
//
//  Returns `true` if `a` is an instance of `stateOf`.
//
var isStateTOf = isInstanceOf(stateTOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(ReaderT.prototype);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('StateT', StateT)
    .property('isStateT', isStateT)
    .property('stateTOf', stateTOf)
    .property('isStateTOf', isStateTOf)
    .method('of', strictEquals(StateT), function(a, b, c) {
        return State.StateT(b).of(c);
    })
    .method('arb', isStateTOf, function(a, b) {
        return State.StateT(this.arb(a.type, b - 1));
    })
    .method('ap', isStateT, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isStateT, function(a, b) {
        return a.chain(b);
    })
    .method('map', isStateT, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isStateT, function(a, b) {
        return [];
    });
