function partial(methods) {
    var self = getInstance(this, partial),
        name = 'call',
        i;

    methods = methods || {};

    self.method = function(predicate, f) {
        var newMethods = extend(methods, singleton(name, (methods[name] || []).concat({
            predicate: predicate,
            f: f
        })));
        return partial(newMethods);
    };

    for(i in methods) {
        if(self[i]) throw new Error("Method `" + i + "` already in partial.");
        else {
            /* Make sure the methods are names */
            var method = makeMethod(methods[i]);
            method._name = i;
            self[i] = method;
        }
    }

    return self;
}

//
//  append methods to the squishy partial.
//
squishy = squishy
    .property('partial', partial);