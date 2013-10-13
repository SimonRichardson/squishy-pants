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
            TIdent: ['ident']
        }),

        isToken = isInstanceOf(Token),
        isTString = isInstanceOf(Token.TString),
        isTNumber = isInstanceOf(Token.TNumber),
        isTIdent = isInstanceOf(Token.TIdent),

        /* Setup the Monadic parser */
        regexp = Parser.regexp,
        string = Parser.string,
        word = regexp(/^\w+/),
        quote = regexp(/^"/),
        number = regexp(/^[\+\-]?\d+(\.\d+)?/),
        ident = regexp(/^[a-zA-Z\_][a-zA-Z0-9\_\-\.]*/),
        ignore = regexp(/^\_/),
        comma = regexp(/^(\s|\,|\s)*/),
        leftBracket = string('('),
        rightBracket = string(')'),
        optionalWhitespace = regexp(/^\s*/),
        ignoreAsString = '_',

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

        /* Block */
        block = identToken.many().also(function() {
            return leftBracket.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightBracket);
            });
        }),
        expr = block.orElse(stringToken)
                    .orElse(numberToken)
                    .orElse(identToken)
                    .orElse(ignore)
                    .skip(comma),
        parser = block.orElse(identToken),

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
        }),

        /* Main access point */
        match = function(patterns) {
            var env = this,
                compile = compiler();

            return function(argument) {
                var key = namespace(argument),
                    args = supplied(argument, fields(argument, key)).getOrElse(constant([])),
                    result = until(patterns, function(c) {
                        var result = compile(c[0]),
                            xx = console.log(JSON.stringify(result));

                            /*
                            value = result.fold(
                                extract(args, key),
                                constant(result)
                            );

                        return value.map(
                            function(x) {
                                return c[1].apply(env, x);
                            }
                        );*/
                        return Option.Some('1');
                    });

                return result.fold(
                    identity,
                    function() {
                        /* Handle the default case */
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
        };

    /* Get the head of the parsed stream */
    function head(a) {
        return squishy.flatten(a)[0];
    }

    /* Get the tail of the parsed stream */
    function tail(a) {
        return a[0].slice(1)[0];
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
        if (isObject(value)) {
            return Object.keys(value._constructors);
        }
        return [];
    }

    /* Return the fields of the taggedSum */
    function fields(a, b) {
        var key = namespaceName(b);
        return a._constructors[key];
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

    /* Return the possible namespace locating parent if found */
    function namespace(a) {
        var parent = a._tagged ? functionName(a._tagged) + '.' : '';
        return squishy.concat(parent, functionName(a));
    }

    /* Return the last part of the namespace i.e. `List.Cons` becomes `Cons` */
    function namespaceName(a) {
        var parts = a.split('.'),
            total = parts.length;
        return total > 1 ? parts[parts.length - 1] : a;
    }

    /* Check to see if the namespace is the same i.e. `List.Cons` now equals `Cons` */
    function namespaceEquality(a, b) {
        return a === b || namespaceName(a) === namespaceName(b);
    }

    function stringEqual(a, b) {
        return a.match({
            String: function(x) {
                return x === b;
            },
            Number: function(x) {
                return x === b;
            }
        });
    }

    /* Recursively match the parsed stream values against the taggedSum values */
    function recursiveMatch(args, a, key) {
        var zipped,
            rest;

        if (namespaceEquality(head(a), key)) {

            zipped = squishy.zip(tail(a), args);

            return squishy.map(
                zipped,
                function(tuple) {
                    var name = tuple._1,
                        value = tuple._2,
                        possibleKey = namespace(value),
                        possibleArgs,
                        possibleSibling;

                    console.log(name, value);

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
                    } else if (name !== ignoreAsString) {
                        possibleSibling = squishy.exists(siblings(value), function(x) {
                            return name === x;
                        });

                        if (possibleSibling && name !== possibleKey) {
                            return Attempt.Failure(['Invalid taggedSum sibling']);
                        }

                        if( stringEqual(name, value) ||
                            numberEqual(name, value) ||
                            identEqual(name, value)) {
                            return Attempt.of(value);
                        }

                        return Attempt.Failure(['Invalid token']);
                    } else {
                        return Attempt.of(ignoreAsString);
                    }
                }
            );
        } else {
            return [Attempt.Failure(['Invalid namespace', head(a), key])];
        }
    }

    return match;
})();

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('match', match);