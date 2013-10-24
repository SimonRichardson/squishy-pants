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
    return StateT(function(s) {
        return env.run(s).chain(function(t) {
            return f(t._1).run(t._2);
        });
    });
};

//
//  ### evalState(s)
//
//  Evaluate the stateT with `s`.
//
StateT.prototype.evalState = function(s) {
    return this.run(s).chain(function(t) {
        return t._1;
    });
};

//
//  ### execState(s)
//
//  Execute the stateT with `s`.
//
StateT.prototype.execState = function(s) {
    return this.run(s).chain(function(t) {
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

State.StateT = function(M) {

    //
    //  ## lift(m)
    //
    //  ConstruStateT `lift` Monad creating a `StateT`.
    //
    StateT.lift = function(m) {
        return StateT(function(b) {
            return m;
        });
    };

    //
    //  ## of(x)
    //
    //  ConstruStateT `of` Monad creating a `StateT`.
    //
    StateT.of = function(a) {
        return StateT(function(b) {
            return M.of(Tuple2(a, b));
        });
    };

    //
    //  ## get()
    //
    //  ConstruStateT `get` to retrieve the stateT value.
    //
    StateT.get = StateT(function(s) {
        return M.of(Tuple2(s, s));
    });

    //
    //  ## modify(f)
    //
    //  ConstruStateT `modify` to alter the stateT value using the function.
    //
    StateT.modify = function(f) {
        return StateT(function(s) {
            return M.of(Tuple2(null, f(s)));
        });
    };

    //
    //  ## put(s)
    //
    //  ConstruStateT `put` to return the value of s.
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
    .method('empty', strictEquals(StateT), function(a, b) {
        return State.StateT(b).empty();
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
