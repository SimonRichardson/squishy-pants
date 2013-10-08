var regexp = Parser.regexp,
    string = Parser.string,
    ident = regexp(/^[a-zA-Z0-9]+/),
    ignore = regexp(/^\_/),
    comma = regexp(/^(\s|\,|\s)*/),
    leftBracket = string('('),
    rightBracket = string(')'),
    optionalWhitespace = regexp(/^\s*/),

    block = ident.many().also(function() {
        return leftBracket.skip(optionalWhitespace).chain(function() {
            return expr.many().skip(rightBracket);
        });
    }),
    expr = block.orElse(ident).orElse(ignore).skip(comma),
    parser = block.orElse(ident);

var extract = curry(function(key, x) {
    var rest;
    if (head(x) === key) {
        rest = tail(x);
        if (rest.length > 0) {
            squishy.map(rest, function(v) {
                if(isArray(v)) {
                    // recursive
                    console.log(v);
                } else if (v !== '_') {
                    // not a wild card
                    console.log(v);
                }
            });
            return Option.Some([]);
        } else {
            return Option.None;
        }
    }

    return Option.None;
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

function matcher(dispatchers, key, args) {
    var accessors = [],
        result;

    for(var i in dispatchers) {
        accessors.push(construct(i, key).fold(
            extract(key),
            identity
        ));
    }

    result = squishy.exists(accessors, function(a) {
        return a.isSome;
    });

    if(!result) {
        throw new TypeError("Constructors given to match didn't include: " + key);
    }

    return false;//accessor.apply(this, args);
}

squishy = squishy
    .property('matcher', matcher);