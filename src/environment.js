function findRegistered(registrations, args) {
    var i,
        total;

    for(i = 0, total = registrations.length; i < total; i++) {
        if(registrations[i].predicate.apply(this, args))
            return registrations[i].f;
    }

    throw new Error("Method not implemented for this input");
}

function makeMethod(registrations) {
    return function() {
        var args = [].slice.call(arguments);
        return findRegistered(registrations, args).apply(this, args);
    };
}

function environment(methods, properties) {
    var self = getInstance(this, environment),
        i;

    methods = methods || {};
    properties = properties || {};

    self.method = function(name, predicate, f) {
        var newMethods = extend(methods, singleton(name, (methods[name] || []).concat({
            predicate: predicate,
            f: f
        })));
        return environment(newMethods, properties);
    };

    self.property = function(name, value) {
        var newProperties = extend(properties, singleton(name, value));
        return environment(methods, newProperties);
    };

    for(i in methods) {
        if(self[i]) throw new Error("Method " + i + " already in environment.");
        self[i] = makeMethod(methods[i]);
    }

    for(i in properties) {
        if(self[i]) throw new Error("Property " + i + " already in environment.");
        self[i] = properties[i];
    }

    return self;
}