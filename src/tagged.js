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
            i;
        if(arguments.length != fields.length) {
            throw new TypeError("Expected " + fields.length + " arguments, got " + arguments.length);
        }
        for(i = 0; i < fields.length; i++) {
            self[fields[i]] = arguments[i];
        }
        return self;
    }

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
function taggedSum(constructors) {
    var key, proto;

    function definitions() {
        throw new TypeError('Tagged sum was called instead of one of its properties.');
    }

    function constructMatch(key) {
        return function(dispatches) {
            var fields = constructors[key],
                args = [],
                total,
                i;

            if(!dispatches[key])
                throw new TypeError("Constructors given to match didn't include: " + key);

            for(i = 0, total = fields.length; i < total; i++) {
                args.push(this[fields[i]]);
            }

            return dispatches[key].apply(this, args);
        };
    }

    function makeProto(key) {
        var proto = create(definitions.prototype);
        proto.match = constructMatch(key);
        return proto;
    }

    for(key in constructors) {
        if(!constructors[key].length) {
            definitions[key] = makeProto(key);
            continue;
        }

        definitions[key] = tagged(key, constructors[key]);
        definitions[key].prototype = makeProto(key);
    }

    return definitions;
}

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('tagged', tagged)
    .property('taggedSum', taggedSum);
