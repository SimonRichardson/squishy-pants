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
//  Constructor `get` to retrieve the `State` value.
//
State.get = State(function(s) {
    return Tuple2(s, s);
});

//
//  ## modify(f)
//
//  Constructor `modify` to alter the `State` value using the function.
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
//  Apply a function in the environment of the value of this `State`
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
//  Bind through the value of the `State`
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
//  Evaluate the `State` with `s`.
//
State.prototype.evalState = function(s) {
    return this.run(s)._1;
};

//
//  ### execState(s)
//
//  Execute the `State` with `s`.
//
State.prototype.execState = function(s) {
    return this.run(s)._2;
};

//
//  ### map(f)
//
//  Map on the value of this `State`.
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
//  ## stateOf(type)
//
//  Sentinel value for when an `State` of a particular type is needed:
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
//  Lens access for an `State` structure.
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
    .property('isState', isState)
    .property('stateOf', stateOf)
    .property('isStateOf', isStateOf)
    .method('of', strictEquals(State), function(x, y) {
        return State.of(y);
    })
    .method('empty', strictEquals(State), function() {
        return State.empty();
    })
    .method('arb', isStateOf, function(a, b) {
        return State.of(this.arb(a.type, b - 1));
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
    .method('shrink', isState, function(a, b) {
        return [];
    });
