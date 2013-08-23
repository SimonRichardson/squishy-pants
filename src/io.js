//
//  # Input/output
//
//  Purely functional IO wrapper.
//

//
//  ## IO(f)
//
//  Pure wrapper around a side-effecting `f` function.
//
//  * perform() - action to be called a single time per program
//  * flatMap(f) - monadic flatMap/bind
//
var IO = tagged('IO', ['unsafePerform']);

IO.of = function(x) {
    return IO(function() {
        return x;
    });
};

IO.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

IO.prototype.chain = function(f) {
    var env = this;
    return IO(function() {
        return f(env.unsafePerform()).unsafePerform();
    });
};

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

squishy = squishy
    .property('IO', IO)
    .property('isIO', isIO)
    .method('of', strictEquals(IO), function(m, a) {
        return IO.of(a);
    })
    .method('ap', isIO, function(a, b) {
        return a.flatMap(b);
    })
    .method('chain', isIO, function(a, b) {
        return a.flatMap(b);
    })
    .method('map', isIO, function(a, b) {
        return a.map(b);
    });
