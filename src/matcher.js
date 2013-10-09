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
                    possibleKey,
                    possibleFields;

                if (squishy.isArray(name)) {

                    possibleKey = functionName(value);
                    possibleFields = value._constructors[possibleKey];

                    if(isArray(possibleFields) && possibleFields.length > 0) {

                        possibleArgs = squishy.select(value, possibleFields);
                        return rec(possibleArgs, [name], possibleKey);
                    }

                    return Attempt.Failure([]);

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

function matcher(options, key, args) {
    var accessors = [],
        result,
        valid,
        value,
        first,
        defaultCase;

    for(var i in options) {
        result = construct(i, key);
        value = result.fold(
            extract(args, key),
            constant(result)
        );
        accessors.push(Tuple2(options[i], value));
    }

    valid = squishy.filter(accessors, function(t) {
        return t._2.isSome;
    });

    if(valid.length < 1) {
        // Handle the default case
        defaultCase = options[ignoreAsString];
        if (defaultCase) {
            return defaultCase.apply(this, []);
        }

        throw new TypeError("Constructors given to match any pattern for: " + key);
    }

    first = valid[0];
    return first._1.apply(this, first._2.extract());
}

squishy = squishy
    .property('matcher', matcher);
