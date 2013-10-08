var regexp = Parser.regexp,
    string = Parser.string,
    ident = regexp(/^[a-zA-Z0-9]+/),
    ignore = regexp(/^\_/),
    comma = regexp(/^\,*/),
    leftBracket = string('('),
    rightBracket = string(')'),
    optionalWhitespace = regexp(/^\s*/),

    block = ident.chain(function() {
        return leftBracket.skip(optionalWhitespace).chain(function() {
            return expr.many().skip(rightBracket);
        });
    }),
    expr = block.orElse(ident).orElse(ignore).skip(optionalWhitespace).skip(comma).skip(optionalWhitespace),
    parser = block.orElse(ident);

function matchesKey(str, key) {
    return parser.parse(str).fold(
        constant(true),
        constant(false)
    );
}

function matcher(dispatchers, key, args) {
    var accessor;

    for(var i in dispatchers) {
        if(matchesKey(i, key)) {
            accessor = dispatchers[i];
            break;
        }
    }

    if(!accessor) {
        throw new TypeError("Constructors given to match didn't include: " + key);
    }

    return accessor.apply(this, args);
}

squishy = squishy
    .property('matcher', matcher);