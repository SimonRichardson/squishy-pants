//   # Environment
//
//   Environments are very important in squishy-pants. The library itself is
//   implemented as a single environment.
//
//   An environment holds methods and properties.
//
//   Methods are implemented as multi-methods, which allow a form of
//   *ad-hoc polymorphism*. Duck typing is another example of ad-hoc
//   polymorphism, but only allows a single implementation at a time, via
//   prototype mutation.
//
//   A method instance is a product of a name, a predicate and an
//   implementation:
//
//       var env = squishy.environment()
//           .method(
//               // Name
//               'negate',
//               // Predicate
//               function(n) {
//                   return typeof n == 'number';
//               },
//               // Implementation
//               function(n) {
//                   return -n;
//               }
//           );
//
//       env.negate(100) == -100;
//
//   We can now override the environment with Some more implementations:
//
//       var env2 = env
//           .method(
//               'negate',
//               function(b) {
//                   return typeof b == 'boolean';
//               },
//               function(b) {
//                   return !b;
//               }
//           );
//
//       env2.negate(100) == -100;
//       env2.negate(true) == false;
//
//   Environments are immutable; references to `env` won't see an
//   implementation for boolean. The `env2` environment could have
//   overwritten the implementation for number and code relying on `env`
//   would still work.
//
//   Properties can be accessed without dispatching on arguments. They
//   can almost be thought of as methods with predicates that always
//   return true:
//
//       var env = squishy.environment()
//           .property('name', 'Squishy');
//
//       env.name === 'Squishy';
//
function findRegistered(name, registrations, args) {
    var i,
        total;

    for(i = 0, total = registrations.length; i < total; i++) {
        if(registrations[i].predicate.apply(this, args))
            return registrations[i].f;
    }

    throw new Error('Method `' + name + '` not implemented for this input');
}

function makeMethod(name, registrations) {
    return function() {
        var args = rest(arguments);
        return findRegistered(name, registrations, args).apply(this, args);
    };
}

//
//   ## environment(methods, properties)
//
//   * `method(name, predicate, f)` - adds an multimethod implementation
//   * `property(name, value)` - sets a property to value
//   * `isDefined(name)` - is a multimethod implement defined
//   * `isDefinedAt(name, ...rest)` - is a multimethod implemented with arguments
//
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

    self.isDefined = function(name) {
        return self[name] && functionName(self[name]) === name;
    };

    self.isDefinedAt = function(name) {
        var result = false,
            args = rest(arguments).slice(1);

        try {
            result = !!findRegistered(name, methods[name], args);
        } catch (e) {}

        return result;
    };

    for(i in methods) {
        if(self[i]) throw new Error("Method `" + i + "` already in environment.");
        else {
            /* Make sure the methods are names */
            var method = makeMethod(i, methods[i]);
            method._name = i;
            self[i] = method;
        }
    }

    for(i in properties) {
        if(self[i]) throw new Error("Property `" + i + "` already in environment.");
        else self[i] = properties[i];
    }

    return self;
}
