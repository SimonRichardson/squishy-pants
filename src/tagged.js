//
//  ## tagged(name, fields)
//
//  Creates a simple constructor for a tagged object.
//
//       var Tuple = tagged('Tuple', ['a', 'b']);
//       var x = Tuple(1, 2);
//       var y = new Tuple(3, 4);
//       x instanceof Tuple && y instanceof Tuple;
//
function tagged(name, fields) {
    function wrapped() {
        var self = getInstance(this, wrapped),
            total = fields.length,
            values = [].slice.call(arguments),
            i;

        if (values.length != total) {
            throw new TypeError("Expected " + fields.length + " arguments, got " + values.length + " for " + name);
        }

        for (i = 0; i < total; i++) {
            self[fields[i]] = values[i];
        }

        self.toString = makeToString(values);

        /* Make sure we don't overwrite already existing implementations */
        if (!self.toArray) {
            self.toArray = makeToArray(values);
        }

        return self;
    }

    function makeToString(a) {
        return function() {
            var values = squishy.map(a, function(x) {
                    return x && x.toString ? x.toString() : '' + x;
                }),
                flattened = squishy.reduce(values, function(x, y) {
                    return x + ', ' + y;
                });
            return name + (values.length > 0 ? '(' + flattened + ')' : '');
        };
    }

    function makeToArray(a) {
        return function() {
            var values = squishy.map(a, function(x) {
                    return x && x.toArray ? x.toArray() : [x];
                }),
                flattened = squishy.fold(values, [], function(x, y) {
                    return squishy.concat(x, y);
                });
            return flattened;
        };
    }

    /* Make sure the fields is an array */
    if (!isArray(fields)) {
        throw new TypeError("Expected Array but got `" + (typeof fields) + "`");
    }

    /* Make sure the tagged are named */
    wrapped._name = name;
    wrapped._length = fields.length;

    return wrapped;
}

//
//  ## taggedSum(constructors)
//
//  Creates a disjoint union of constructors, with a catamorphism.
//
//        var List = taggedSum({
//            Cons: ['car', 'cdr'],
//            Nil: []
//        });
//        function listLength(l) {
//            return l.match({
//                Cons: function(car, cdr) {
//                    return 1 + listLength(cdr);
//                },
//                Nil: function() {
//                    return 0;
//                }
//            });
//        }
//        listLength(List.Cons(1, new List.Cons(2, List.Nil()))) == 2;
//
function taggedSum(name, constructors) {
    var key,
        proto;

    function definitions() {
        throw new TypeError('Tagged sum was called instead of one of its properties.');
    }

    function constructMatch(key) {
        return function(dispatches) {
            var fields = constructors[key],
                accessor = dispatches[key],
                args = squishy.select(this, fields);

            if(!accessor) {
                throw new TypeError("Constructors given to match didn't include: " + key);
            }

            return accessor.apply(this, args);
        };
    }

    function makeProto(key, constructors) {
        var proto = create(definitions.prototype);
        proto.match = constructMatch(key);

        /*
            - Make sure the taggedSum are named
            - Pass the constructors around so we can then do recursive matching.
            - Make sure that taggedSum items have a toString
        */
        proto._name = key;
        proto._tagged = definitions;
        proto._constructors = constructors;

        proto.toString = constant(key);

        return proto;
    }

    for (key in constructors) {
        if (!constructors[key].length) {
            definitions[key] = makeProto(key, definitions);
            definitions[key].toArray = constant([]);
            continue;
        }

        definitions[key] = tagged(key, constructors[key]);
        definitions[key].prototype = makeProto(key, constructors);
    }

    definitions._name = name;

    return definitions;
}

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('tagged', tagged)
    .property('taggedSum', taggedSum);
