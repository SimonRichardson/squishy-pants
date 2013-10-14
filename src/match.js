//
//   # Match
//
//   Monad pattern matching.
//
//      var m = _.match([
//                    ['Cons(Some(a), _)', function(a) { return a; }],
//                    ['Cons(None, _)', function(x, y, z) { return 0; }],
//                    ['_', function() { return -1; }]);
//          m(_.Cons(_.Some(1), _.Nil));
//
//   * `match(patterns)(value)` - Construction.
//
var match = (function() {

    /* Token */
    var Token = taggedSum('Token', {
            TString: ['string'],
            TNumber: ['number'],
            TIdent: ['ident'],
            TWildcard: []
        }),

        isToken = isInstanceOf(Token),

        /* Setup the Monadic parser */
        regexp = Parser.regexp,
        string = Parser.string,
        word = regexp(/^\w+/),
        quote = regexp(/^"/),
        number = regexp(/^[\+\-]?\d+(\.\d+)?/),
        ident = regexp(/^[a-zA-Z\_][a-zA-Z0-9\_\-\.]*/),
        wildcard = regexp(/^\_/),
        comma = regexp(/^(\s|\,|\s)*/),
        leftBracket = string('('),
        rightBracket = string(')'),
        optionalWhitespace = regexp(/^\s*/),
        wildcardAsString = '_',

        /* Tokens */
        stringToken = quote.chain(function() {
            return word.skip(optionalWhitespace).many().skip(quote);
        }).map(function(a) {
            return Token.TString(a);
        }),
        numberToken = number.map(function(a) {
            return Token.TNumber(parseFloat(a, 10));
        }),
        identToken = ident.map(function(a) {
            return Token.TIdent(a);
        }),
        wildcardToken = wildcard.map(function() {
            return Token.TWildcard;
        }),

        /* Block */
        block = identToken.many().also(function() {
            return leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            });
        }),
        expr = block.orElse(wildcardToken)
                    .orElse(stringToken)
                    .orElse(numberToken)
                    .orElse(identToken)
                    .skip(comma),
        parser = block.orElse(wildcardToken)
                      .orElse(identToken),

        /* Start extracting the possible patterns */
        extract = curry(function(args, key, x) {
            var result = recursiveMatch(args, x, key),
                flattened = squishy.chain(result, function(a) {
                    return recursiveFlatten([a]);
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
                    return !a.value.isWildcard;
                });
                mapped = squishy.map(filtered, function(a) {
                    return a.extract();
                });
                return Option.of(mapped);
            }
        }),

        /* Main access point */
        match = function(patterns) {
            var env = this,
                compile = compiler();

            return function(argument) {
                var key = Token.TIdent([functionName(argument)]),
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
                        /* Handle the default case */
                        var defaultCase = env.find(patterns, function(x) {
                            return x[0] === wildcardAsString;
                        });
                        if (isArray(defaultCase)) {
                            return defaultCase[1].apply(this, []);
                        }

                        throw new TypeError('No default case found.');
                    }
                );
            };
        };

    /* Get the head of the parsed stream */
    function head(a) {
        if (isArray(a)) {
            return squishy.flatten(a)[0];
        }
        return a;
    }

    /* Get the tail of the parsed stream */
    function tail(a) {
        if (isArray(a)) {
            return a[0].slice(1)[0];
        }
        return [a];
    }

    /* Recursively flatten the arguments */
    function recursiveFlatten(a) {
        return squishy.fold(a, [], function(x, y) {
            return squishy.concat(x, isArray(y) ? recursiveFlatten(y) : y);
        });
    }

    /* Compile the stream into an array and cache the results for later */
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

    /* Return the siblings of the taggedSum  */
    function siblings(value) {
        if (isObject(value) && value._constructors) {
            return Object.keys(value._constructors);
        }
        return [];
    }

    /* Return the fields of the taggedSum */
    function fields(a, b) {
        var key = b.isIdent ? Option.of(b.ident) : Option.empty();
        return key.match({
            Some: function(x) {
                return a._constructors[x];
            },
            None: constant([])
        });
    }

    /* Return the values from the value using the fields of the taggedSum */
    function supplied(value, fields) {
        if(isArray(fields) && fields.length > 0) {
            return Option.Some(squishy.select(value, fields));
        }
        return Option.None;
    }

    /* Continue to iterate through the array until an Option.Some is located */
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

    /* Recursively match the parsed stream values against the taggedSum values */
    function recursiveMatch(args, a, key) {
        var zipped,
            rest;

        if (head(a).equal(key)) {

            zipped = squishy.zip(tail(a), args);

            return squishy.map(
                zipped,
                function(tuple) {
                    var name = tuple._1,
                        value = tuple._2,
                        possibleKey = Token.TIdent([functionName(value)]),
                        possibleArgs,
                        possibleSibling;

                    if (squishy.isArray(name)) {
                        possibleArgs = supplied(value, fields(value, possibleKey));

                        return possibleArgs.fold(
                            function(x) {
                                return recursiveMatch(x, [name], possibleKey);
                            },
                            function() {
                                return Attempt.Failure(['Invalid tokens']);
                            }
                        );
                    } else if (!name.isWildcard) {
                        possibleSibling = squishy.exists(siblings(value), function(x) {
                            return name.isIdent ? squishy.equal(name.ident[0], x) : false;
                        });

                        if (possibleSibling && name.similar(value)) {
                            return Attempt.of(Token.TWildcard);
                        } else if(!possibleSibling && name.isIdent) {
                            return Attempt.of(value);
                        } else if(name.equal(value) || name.similar(value)) {
                            return Attempt.of(value);
                        }

                        return Attempt.Failure(['Invalid token']);
                    } else {
                        return Attempt.of(Token.TWildcard);
                    }
                }
            );
        } else {
            return [Attempt.Failure(['Invalid namespace', head(a), key])];
        }
    }

    //
    //  ## equal(b)
    //
    //  Compare two option values for equality
    //
    Token.prototype.equal = function(b) {
        return this.match({
            TIdent: function(x) {
                return b.isWildcard || b.isIdent && squishy.equal(b.ident, x);
            },
            TNumber: function(x) {
                return b.isWildcard || b.isNumber && squishy.equal(b.number, x);
            },
            TString: function(x) {
                return b.isWildcard || b.isString && squishy.equal(b.string, x);
            },
            TWildcard: constant(true)
        });
    };

    //
    //  ## similar(b)
    //
    //  Compare two option values for similarity
    //
    Token.prototype.similar = function(b) {
        return this.match({
            TIdent: function(c) {
                return b.isWildcard || squishy.equal(c[0], functionName(b));
            },
            TNumber: function(c) {
                return b.isWildcard || isNumber(b) && squishy.equal(c, b);
            },
            TString: function(c) {
                return b.isWildcard || isString(b) && squishy.equal(c[0].join(' '), b);
            },
            TWildcard: constant(true)
        });
    };

    //
    //  ## TIdent(x)
    //
    //  Constructor to represent the ident token with a value, `x`.
    //
    Token.TIdent.prototype.isIdent = true;
    Token.TIdent.prototype.isNumber = false;
    Token.TIdent.prototype.isString = false;
    Token.TIdent.prototype.isWildcard = false;

    //
    //  ## TNumber(x)
    //
    //  Constructor to represent the number token with a value, `x`.
    //
    Token.TNumber.prototype.isIdent = false;
    Token.TNumber.prototype.isNumber = true;
    Token.TNumber.prototype.isString = false;
    Token.TNumber.prototype.isWildcard = false;

    //
    //  ## TString(x)
    //
    //  Constructor to represent the string token with a value, `x`.
    //
    Token.TString.prototype.isIdent = false;
    Token.TString.prototype.isNumber = false;
    Token.TString.prototype.isString = true;
    Token.TString.prototype.isWildcard = false;

    //
    //  ## TWildcard(x)
    //
    //  Constructor to represent the wildcard token.
    //
    Token.TWildcard.isIdent = false;
    Token.TWildcard.isNumber = false;
    Token.TWildcard.isString = false;
    Token.TWildcard.isWildcard = true;

    //
    //  Return the match function
    //
    return match;
})();

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('match', match);
