//   # partial
//
//   Methods are implemented as multi-methods, which allow a form of
//   *ad-hoc polymorphism*. Duck typing is another example of ad-hoc
//   polymorphism, but only allows a single implementation at a time, via
//   prototype mutation.
//
//   A method instance is a predicate and a implementation:
//
//       var partial = squishy.partial()
//           .method(squishy.isEven, squishy.identity)
//           .method(squishy.isOdd, squishy.negate),
//           result = partial.call(null, 3);
//
//       result === -3;
//
//  * `method(predicate, f)` - add a method with a predicate guard.
//  * `isDefinedAt()` - find if a method conforms to the predicate or not.
//  * `call(scope)` - call the method with a scope and series of arguments.
//  * `apply(scope, [])` - call the method with a scope and array of arguments.
//
function partial(methods) {
    var self = getInstance(this, partial),
        i;

    methods = methods || [];

    self.method = function(predicate, f) {
        var newMethods = (methods || []).concat({
            predicate: predicate,
            f: f
        });
        return partial(newMethods);
    };

    self.isDefinedAt = function() {
        var args = [].slice.call(arguments);
        return exists(methods, function(m) {
            return m.predicate.apply(null, args);
        });
    };

    /* Override function call to mask as a real function */
    self.call = function(scope) {
        return self.apply(scope, [].slice.call(arguments).slice(1));
    };

    /* Override function apply to mask as a real function */
    self.apply = function(scope, args) {
        var total,
            i;

        for (i = 0, total = methods.length; i < total; i++) {
            if (methods[i].predicate.apply(scope, args)) {
                return methods[i].f.apply(scope, args);
            }
        }

        /* Show we warn about the non-exhaustive check for arguments */
        return null;
    };

    /* Override function length to mask as a real function */
    self.length = 1;
    self._functionName = 'partial';

    return self;
}

//
//  append methods to the squishy partial.
//
squishy = squishy
    .property('partial', partial);
