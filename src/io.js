//
//  # Input/output
//
//  Purely functional IO wrapper.
//

//
//  ## io(f)
//
//  Pure wrapper around a side-effecting `f` function.
//
//  * perform() - action to be called a single time per program
//  * flatMap(f) - monadic flatMap/bind
//
function io(f) {
    var self = getInstance(this, io);

    self.perform = function() {
        return f();
    };

    self.flatMap = function(g) {
        return io(function() {
            return g(f()).perform();
        });
    };

    return self;
}

//
//  ## isIO(a)
//
//  Returns `true` if `a` is an `io`.
//
var isIO = isInstanceOf(io);

squishy = squishy
    .property('io', io)
    .property('isIO', isIO)
    .method('pure', strictEquals(io), function(m, a) {
        return io(function() {
            return a;
        });
    })
    .method('flatMap', isIO, function(a, b) {
        return a.flatMap(b);
    });
