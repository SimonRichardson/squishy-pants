//
//  # Input/output
//
//  Purely functional IO wrapper.
//

//
//   ## IO(f)
//
//   Pure wrapper around a side-effecting `f` function.
//
//   * `unsafePerform()` - action to be called a single time per program
//   * `ap(b, concat)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `map(f)` - Functor map
//
var IO = tagged('IO', ['unsafePerform']);

IO.of = function(x) {
    return IO(function() {
        return x;
    });
};

//
//  ### ap(b)
//
//  Apply a function in the environment of IO
//  Applicative ap(ply)
//
IO.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### chain(f)
//
//  Bind through the f of an IO
//  Monadic flatMap/bind
//
IO.prototype.chain = function(f) {
    var env = this;
    return IO(function() {
        return f(env.unsafePerform()).unsafePerform();
    });
};

//
//  ### map(f)
//
//  Map on the f of this IO.
//  Functor map
//
IO.prototype.map = function(f) {
    return this.chain(function(a) {
        return IO.of(f(a));
    });
};

//
//  ## isIO(a)
//
//  Returns `true` if `a` is an `io`.
//
var isIO = isInstanceOf(IO);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(IO.prototype);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('IO', IO)
    .property('isIO', isIO)
    .method('of', strictEquals(IO), function(m, a) {
        return IO.of(a);
    })
    .method('ap', isIO, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isIO, function(a, b) {
        return a.chain(b);
    })
    .method('map', isIO, function(a, b) {
        return a.map(b);
    });
