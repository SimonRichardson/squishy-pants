var regexp = Parser.regexp,
    string = Parser.string,
    ident = regexp(/^[a-zA-Z0-9]+/),
    ignore = regexp(/^\_/),
    comma = regexp(/^(\s|\,|\s)*/),
    leftBracket = string('('),
    rightBracket = string(')'),
    optionalWhitespace = regexp(/^\s*/),
    ignoreAsString = '_',

    block = ident.many().also(function() {
        return leftBracket.skip(optionalWhitespace).chain(function() {
            return expr.many().skip(rightBracket);
        });
    }),
    expr = block.orElse(ident).orElse(ignore).skip(comma),
    parser = block.orElse(ident);


var rec = function(args, a, key) {
    var zipped;

    if (head(a) === key) {

        zipped = squishy.zip(tail(a), args);

        return squishy.map(
            zipped,
            function(tuple) {
                var name = tuple._1,
                    value = tuple._2,
                    possibleArgs,
                    possibleKey;

                if (squishy.isArray(name)) {

                    possibleKey = functionName(value);
                    possibleArgs = supplied(value, fields(value, possibleKey));

                    return possibleArgs.fold(
                        function(x) {
                            return rec(x, [name], possibleKey);
                        },
                        function() {
                            return Attempt.Failure([]);
                        }
                    );
                } else if (name !== ignoreAsString) {
                    return Attempt.of(value);
                } else {
                    return Attempt.of('_');
                }
            }
        );
    } else {
        return Attempt.Failure([]);
    }
};

var extract = curry(function(args, key, x) {
    var result = rec(args, x, key),
        flattened = squishy.chain(result, function(a) {
            return flatten([a]);
        }),
        failed = squishy.exists(flattened, function(a) {
            return a.isFailure;
        }),
        filtered,
        mapped;

    if (failed) {
        return Option.None;
    } else {
        filtered = squishy.filter(flattened, function(a) {
            return a.fold(
                function(v) {
                    return v !== ignoreAsString;
                },
                constant(false)
            );
        });
        mapped = squishy.map(filtered, function(a) {
            return a.extract();
        });
        return Option.of(mapped);
    }
});

function head(a) {
    return squishy.flatten(a)[0];
}

function tail(a) {
    return a[0].slice(1)[0];
}

function construct(str) {
    return parser.parse(str).fold(
        Option.of,
        Option.empty
    );
}

function fields(value, key) {
    return value._constructors[key];
}

function supplied(value, fields) {
    if(isArray(fields) && fields.length > 0) {
        return Option.Some(squishy.select(value, fields));
    }
    return Option.None;
}

function until(a, f) {
    var result,
        i;

    for(i = 0; i < a.length; i++) {
        result = f(a[i]);
        if (result.isSome) {
            return result;
        }
    }

    return Option.None;
}

var matcher = curry(function(a, b) {
    var env = this,
        key = functionName(b),
        args = supplied(b, fields(b, key)).getOrElse(constant([])),
        result = until(a, function(c) {
            var result = construct(c[0], key),
                value = result.fold(
                    extract(args, key),
                    constant(result)
                );

            return value.map(
                function(x) {
                    return c[1].apply(env, x);
                }
            );
        });

    return result.fold(
        identity,
        function() {
            // Handle the default case
            var defaultCase = env.find(a, function(x) {
                return x[0] === ignoreAsString;
            });
            if (isArray(defaultCase)) {
                return defaultCase[1].apply(this, []);
            }

            throw new TypeError("Constructors given to match any pattern for: " + key);
        }
    );
});

squishy = squishy
    .property('matcher', matcher);
