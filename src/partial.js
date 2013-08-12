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

    self.isDefinedAt = function(value) {
        return exists(methods, function(m) {
            return m.predicate(value);
        });
    };

    self.apply = function(scope, args) {
        var total,
            i;

        for (i = 0, total = methods.length; i < total; i++) {
            if (methods[i].predicate.apply(scope, args)) {
                return methods[i].f.apply(scope, args);
            }
        }

        return null;
    };

    return self;
}

//
//  append methods to the squishy partial.
//
squishy = squishy
    .property('partial', partial);