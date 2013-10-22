//
//  ## State(run)
//
//  Monadic state.
//
//   * `ap(b, concat)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `map(f)` - Functor map
//
var State = tagged('State', ['run']);

//
//  ## of(x)
//
//  Constructor `of` Monad creating a `State`.
//
State.of = function(a) {
    return State(function(b) {
        return Tuple2(a, b);
    });
};

//
//  ## empty()
//
//  Constructor `empty` Monad creating a empty `State`.
//
State.empty = function() {
    return State(function(b) {
        return Tuple2(null, b);
    });
};

//
//  ## get()
//
//  Constructor `get` to retrieve the state value.
//
State.get = State(function(s) {
    return Tuple2(s, s);
});

//
//  ## modify(f)
//
//  Constructor `modify` to alter the state value using the function.
//
State.modify = function(f) {
    return State(function(s) {
        return Tuple2(null, f(s));
    });
};

//
//  ## put(s)
//
//  Constructor `put` to return the value of `s`.
//
State.put = function(s) {
    return State.modify(function(a) {
        return s;
    });
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of this state
//  Applicative ap(ply)
//
State.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the state
//  Monadic flatMap/bind
//
State.prototype.chain = function(f) {
    var env = this;
    return State(function(s) {
        var result = env.run(s);
        return f(result._1).run(result._2);
    });
};

//
//  ### evalState(s)
//
//  Evaluate the state with `s`.
//
State.prototype.evalState = function(s) {
    return this.run(s)._1;
};

//
//  ### execState(s)
//
//  Execute the state with `s`.
//
State.prototype.execState = function(s) {
    return this.run(s)._2;
};

//
//  ### map(f)
//
//  Map on the value of this state.
//  Functor map
//
State.prototype.map = function(f) {
    return this.chain(function(a) {
        return State.of(f(a));
    });
};

//
//  ## isState(a)
//
//  Returns `true` if `a` is `State`.
//
var isState = isInstanceOf(State);

//
//  ## State Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//  * `ap(a)` - applicative ap(ply)
//
var StateT = tagged('StateT', ['run']);

var stateTransformer = function(ctor) {

    var x = transformer(ctor);

    //
    //  ### chain(f)
    //
    //  Bind through the value of the state transformer
    //  Monadic flatMap/bind
    //
    StateT.prototype.chain = function(f) {
        var state = this;
        return StateT(function(s) {
            return state.run(s).chain(function(t) {
                return f(t._1).run(t._2);
            });
        });
    };

    //
    //  ### evalState(s)
    //
    //  Evaluate the stateT with `s`.
    //
    ctor.prototype.evalState = function(s) {
        return this.run(s).chain(function(t) {
            return t._1;
        });
    };

    //
    //  ### execState(s)
    //
    //  Execute the stateT with `s`.
    //
    ctor.prototype.execState = function(s) {
        return this.run(s).chain(function(t) {
            return t._2;
        });
    };

    return function(M) {

        var result = x(M);

        //
        //  ## lift(m)
        //
        //  Constructor `lift` Monad creating a `StateT`.
        //
        ctor.lift = function(m) {
            return ctor(function(b) {
                return m;
            });
        };

        //
        //  ## of(x)
        //
        //  Constructor `of` Monad creating a `StateT`.
        //
        ctor.of = function(a) {
            return ctor(function(b) {
                return M.of(Tuple2(a, b));
            });
        };

        //
        //  ## get()
        //
        //  Constructor `get` to retrieve the stateT value.
        //
        ctor.get = ctor(function(s) {
            return M.of(Tuple2(s, s));
        });

        //
        //  ## modify(f)
        //
        //  Constructor `modify` to alter the stateT value using the function.
        //
        ctor.modify = function(f) {
            return ctor(function(s) {
                return M.of(Tuple2(null, f(s)));
            });
        };

        //
        //  ## put(s)
        //
        //  Constructor `put` to return the value of s.
        //
        ctor.put = function(s) {
            return ctor.modify(function(a) {
                return s;
            });
        };

        return result;
    };
};

State.StateT = stateTransformer(StateT);

//
//  ## isStateT(a)
//
//  Returns `true` if `a` is `StateT`.
//
var isStateT = isInstanceOf(StateT);

//
//  ## stateOf(type)
//
//  Sentinel value for when an state of a particular type is needed:
//
//       stateOf(Number)
//
function stateOf(type) {
    var self = getInstance(this, stateOf);
    self.type = type;
    return self;
}

//
//  ## isStateOf(a)
//
//  Returns `true` if `a` is an instance of `stateOf`.
//
var isStateOf = isInstanceOf(stateOf);

//
//  ## stateTOf(type)
//
//  Sentinel value for when an state of a particular type is needed:
//
//       stateOf(Number)
//
function stateTOf(type) {
    var self = getInstance(this, stateOf);
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
fo.unsafeSetValueOf(State.prototype);

//
//  ### lens
//
//  Lens access for an state structure.
//
State.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return State(s);
            },
            function() {
                return a;
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('State', State)
    .property('StateT', StateT)
    .property('isState', isState)
    .property('isStateT', isStateT)
    .property('stateOf', stateOf)
    .property('stateTOf', stateTOf)
    .property('isStateOf', isStateOf)
    .property('isStateTOf', isStateTOf)
    .method('of', strictEquals(State), function(x, y) {
        return State.of(y);
    })
    .method('empty', strictEquals(State), function() {
        return State.empty();
    })

    .method('arb', isStateOf, function(a, b) {
        return State.of(this.arb(a.type, b - 1));
    })
    .method('arb', isStateTOf, function(a, b) {
        return State.StateT(this.arb(stateOf(a.type), b - 1));
    })

    .method('ap', squishy.liftA2(or, isState, isStateT), function(a, b) {
        return a.ap(b);
    })
    .method('chain', squishy.liftA2(or, isState, isStateT), function(a, b) {
        return a.chain(b);
    })
    .method('map', squishy.liftA2(or, isState, isStateT), function(a, b) {
        return a.map(b);
    })
    .method('shrink', squishy.liftA2(or, isState, isStateT), function(a, b) {
        return [];
    });
