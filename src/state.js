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

// Transformer
State.StateT = function(M) {

    //
    //  Monadic state transformer.
    //
    //   * `ap(b, concat)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `map(f)` - Functor map
    //
    var StateT = tagged('StateT', ['run']);

    //
    //  ## lift(m)
    //
    //  Constructor `lift` Monad creating a `StateT`.
    //
    StateT.lift = function(m) {
        return StateT(function(b) {
            return m;
        });
    };

    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating a `StateT`.
    //
    StateT.of = function(a) {
        return StateT(function(b) {
            return M.of(Tuple2(a, b));
        });
    };

    //
    //  ## get()
    //
    //  Constructor `get` to retrieve the stateT value.
    //
    StateT.get = StateT(function(s) {
        return M.of(Tuple2(s, s));
    });

    //
    //  ## modify(f)
    //
    //  Constructor `modify` to alter the stateT value using the function.
    //
    StateT.modify = function(f) {
        return StateT(function(s) {
            return M.of(Tuple2(null, f(s)));
        });
    };

    //
    //  ## put(s)
    //
    //  Constructor `put` to return the value of s.
    //
    StateT.put = function(s) {
        return StateT.modify(function(a) {
            return s;
        });
    };

    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the value of this stateT
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
    //  Bind through the value of the stateT
    //  Monadic flatMap/bind
    //
    StateT.prototype.chain = function(f) {
        var state = this;
        return StateT(function(s) {
            var result = state.run(s);
            return result.chain(function(t) {
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
    //  Map on the value of this stateT.
    //  Functor map
    //
    StateT.prototype.map = function(f) {
        return this.chain(function(a) {
            return StateT.of(f(a));
        });
    };

    return StateT;
};

//
//  ## isState(a)
//
//  Returns `true` if `a` is `State`.
//
var isState = isInstanceOf(State);

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
                return a.run;
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('State', State)
    .property('isState', isState)
    .property('stateOf', stateOf)
    .property('isStateOf', isStateOf)
    .method('of', strictEquals(State), function(x) {
        return State.of(x);
    })
    .method('ap', isState, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isState, function(a, b) {
        return a.chain(b);
    })
    .method('map', isState, function(a, b) {
        return a.map(b);
    })
    .method('arb', isStateOf, function(a, b) {
        return State.of(this.arb(a.type, b - 1));
    })
    .method('shrink', isState, function(a, b) {
        return [];
    });
