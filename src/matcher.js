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
    parser = block.orElse(ident),

    extract = curry(function(args, key, x) {
        var result = recursiveMatch(args, x, key),
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

function compiler() {
    var cache = {};
    return function(stream) {
        var result;
        if (!(stream in cache)) {
            result = parser.parse(stream).fold(
                Option.of,
                Option.empty
            );

            cache[stream] = result;
        }
        return cache[stream];
    };
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

function recursiveMatch(args, a, key) {
    var zipped,
        rest;

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
                            return recursiveMatch(x, [name], possibleKey);
                        },
                        function() {
                            return Attempt.Failure([]);
                        }
                    );
                } else if (name !== ignoreAsString) {
                    return Attempt.of(value);
                } else {
                    return Attempt.of(ignoreAsString);
                }
            }
        );
    } else {
        return Attempt.Failure([]);
    }
}

function match(patterns) {
    var env = this,
        compile = compiler();

    return function(argument) {
        var key = functionName(argument),
            args = supplied(argument, fields(argument, key)).getOrElse(constant([])),
            result = until(patterns, function(c) {
                var result = compile(c[0]),
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
                var defaultCase = env.find(patterns, function(x) {
                    return x[0] === ignoreAsString;
                });
                if (isArray(defaultCase)) {
                    return defaultCase[1].apply(this, []);
                }

                throw new TypeError('No default case found.');
            }
        );
    };
}

squishy = squishy
    .property('match', match);
