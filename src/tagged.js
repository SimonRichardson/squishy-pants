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
            i;
        if(arguments.length != total) {
            throw new TypeError("Expected " + fields.length + " arguments, got " + arguments.length);
        }
        for(i = 0; i < total; i++) {
            self[fields[i]] = arguments[i];
        }
        return self;
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
    var key, proto;

    function definitions() {
        throw new TypeError('Tagged sum was called instead of one of its properties.');
    }

    function constructFields(o, fields) {
        var args = [],
            total,
            i;

        for(i = 0, total = fields.length; i < total; i++) {
            args.push(o[fields[i]]);
        }

        return args;
    }

    function constructMatch(key) {
        return function(dispatches) {
            var fields = constructors[key],
                accessor = dispatches[key],
                args = constructFields(this, fields),
                total,
                i;

            if(!accessor)
                throw new TypeError("Constructors given to match didn't include: " + key);

            /*


              TODO (Simon) : Make this recursive so we actually use the match on the first constructor.

            */
            if (isObject(accessor)) {
                var first = args[0],
                    name = functionName(first),
                    sub = accessor[name];

                if (sub) {
                    var opt = {},
                        j;

                    for (j in first._constructors) {
                        opt[j] = accessor[j];
                    }

                    return first.match(opt);
                } else {
                    throw new TypeError('Constructor not found: ' + key);
                }
            } else {
                return accessor.apply(this, args);
            }
        };
    }

    function makeProto(key, constructors) {
        var proto = create(definitions.prototype);
        proto.match = constructMatch(key);
        proto._constructors = constructors;

        /* Make sure the taggedSum are named */
        proto._name = key;

        return proto;
    }

    for(key in constructors) {
        if(!constructors[key].length) {
            definitions[key] = makeProto(key, definitions);
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
