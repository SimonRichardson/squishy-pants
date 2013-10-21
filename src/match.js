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

    //
    //  ## Token
    //
    //  The token type encodes the presence of a certain data type from
    //  the parser.
    //
    var Token = taggedSum('Token', {
            TString: ['string'],
            TNumber: ['number'],
            TIdent: ['ident'],
            TObject: ['object'],
            TWildcard: []
        }),

        //
        //  ### isToken(a)
        //
        //  Returns `true` if `a` is an instance of `token`.
        //
        isToken = isInstanceOf(Token),

        //
        //  ### Parser
        //
        //  Monadic parser creation.
        //
        regexp = Parser.regexp,
        string = Parser.string,
        word = regexp(/^.[^"]*/),
        quote = regexp(/^"/),
        number = regexp(/^[\+\-]?\d+(\.\d+)?/),
        ident = regexp(/^[a-zA-Z\_][a-zA-Z0-9\_\-\.]*/),
        wildcard = regexp(/^\_/),
        colon = regexp(/^\s*:\s*/m),
        comma = regexp(/^(\s|\,|\s)*/),
        commaObject = regexp(/^,\s*/m),
        leftParen = string('('),
        rightParen = string(')'),
        leftCurly = regexp(/^[{]\s*/m),
        rightCurly = string('}'),
        leftSquare = regexp(/^\[\s*/m),
        rightSquare = string(']'),
        optionalWhitespace = regexp(/^\s*/),
        emptyString = string(''),
        wildcardAsString = '_',

        /* Tokens */
        stringToken = quote.chain(function() {
            return word.skip(quote);
        }).map(function(a) {
            return Token.TString(a);
        }),
        emptyStringToken = quote.chain(function() {
            return emptyString.skip(quote);
        }).map(function() {
            return Token.TString(['']);
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

        /* Destructuring */
        merge = function(x) {
            var total = x.length,
                accum = [],
                value,
                i;

            for(i = 0; i < total; i++) {
                value = x[i];
                if (isArray(value)) {
                    if (!isArray(accum[0])) {
                        accum[0] = [];
                    }
                    accum[0] = accum[0].concat(value);
                } else {
                    accum.push(value);
                }
            }

            return accum;
        },

        normalise = function(x) {
            if (isArray(x)) {
                return recursiveFlatten(x).map(function(a) {
                    return normalise(a);
                });
            } else if (isToken(x)) {
                return [x.extract()];
            } else if (isString(x) || isNumber(x)) {
                return [x];
            } else if (isTuple2(x)) {
                return [normalise(x._1), merge(normalise(x._2))];
            } else {
                return [];
            }
        },

        consume = function(parser) {
            return parser.chain(function(stream, index, attempt) {
                var x = attempt.fold(identity, constant([])),
                    a = normalise(x);
                return commaObject.chain(function() {
                    return parser;
                }).many().map(function(y) {
                    var b = merge(normalise(y));
                    return squishy.concat(a, b[0]);
                });
            });
        },

        array = leftSquare.chain(function() {
            return consume(destructure).skip(rightSquare);
        }),

        object = leftCurly.chain(function() {
            return consume(pair);
        }).skip(rightCurly).map(function(pairs) {
            var accum = {},
                clean = pairs.filter(function(a) {
                    return !!a;
                }),
                i;
            for (i = 0; i < clean.length; i += 2) {
                accum[clean[i]] = clean[i + 1][0];
            }
            return accum;
        }),

        objectToken = object.map(function(a) {
            return Token.TObject(a);
        }),

        stringLiteral = regexp(/^"(\\.|.)*?"/).map(function(str) {
            return Token.TString(str[0].slice(1, -1));
        }),

        numberLiteral = regexp(/^\d+(([.]|e[+-]?)\d+)?/i).map(function(str) {
            return Token.TNumber(parseFloat(str, 10));
        }),

        pair = stringLiteral.orElse(ident).chain(function(stream, index, attempt) {
            return colon.chain(function() {
                return destructure;
            }).map(function(res) {
                var key = attempt.fold(identity, constant(''));
                return Tuple2(key, res);
            });
        }),

        destructure = object.orElse(stringLiteral)
                            .orElse(numberLiteral)
                            .orElse(array)
                            .skip(optionalWhitespace),

        /* Block */
        block = identToken.many().also(function() {
            return leftParen.skip(optionalWhitespace).chain(function() {
                return expr.many().skip(rightParen);
            });
        }),
        expr = block.orElse(wildcardToken)
                    .orElse(emptyStringToken)
                    .orElse(stringToken)
                    .orElse(numberToken)
                    .orElse(identToken)
                    .orElse(objectToken)
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

        //
        //  ## match(patterns)
        //
        //  Constructor for the patterns expression.
        //
        match = function(patterns) {
            var env = this,
                compile = compiler();

            return function(argument) {
                var key = Token.TIdent([functionName(argument)]),
                    args = supplied(argument, fields(argument, key)).getOrElse(constant([])),
                    result = until(patterns, function(c) {
                        var result = compile(c[0]),
                            /*xx = console.log(JSON.stringify(result)),*/
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
                    error('No default case found.')
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
        var env = this;
        return env.match({
            TIdent: function(x) {
                var last0 = squishy.last(env.namespace()),
                    last1 = b.isIdent ? squishy.last(b.namespace()) : [];
                return squishy.equal(last0, last1);
            },
            TNumber: function(x) {
                return isNumber(b) && squishy.equal(b.number, x);
            },
            TString: function(x) {
                return isString(b) && squishy.equal(b.string, x);
            },
            TObject: function(x) {
                return isPlainObject(b) && squishy.equal(b.object, x);
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
            TIdent: function(x) {
                return squishy.equal(x[0], functionName(b));
            },
            TNumber: function(x) {
                var norm = isUndefined(x[0]) ? x : x[0];
                return isNumber(b) && squishy.equal(norm, b);
            },
            TString: function(x) {
                return isString(b) && squishy.equal(x[0], b);
            },
            TObject: function(x) {
                //console.log('TObj', x, b);
                return isPlainObject(b) && squishy.equal(x, b);
            },
            TWildcard: constant(true)
        });
    };

    //
    //  ### extract()
    //
    //  Extract the possible value of each
    //
    Token.prototype.extract = function() {
        return this.match({
            TIdent: identity,
            TNumber: identity,
            TString: identity,
            TObject: identity,
            TWildcard: constant(null)
        });
    };

    //
    //  ### namespace()
    //
    //  Retrieve the possible TIdent namespace
    //
    Token.TIdent.prototype.namespace = function() {
        return this.ident.join('').split('.');
    };

    //
    //  ## TIdent(x)
    //
    //  Constructor to represent the ident token with a value, `x`.
    //
    Token.TIdent.prototype.isIdent = true;
    Token.TIdent.prototype.isNumber = false;
    Token.TIdent.prototype.isString = false;
    Token.TIdent.prototype.isObject = false;
    Token.TIdent.prototype.isWildcard = false;

    //
    //  ## TNumber(x)
    //
    //  Constructor to represent the number token with a value, `x`.
    //
    Token.TNumber.prototype.isIdent = false;
    Token.TNumber.prototype.isNumber = true;
    Token.TNumber.prototype.isString = false;
    Token.TNumber.prototype.isObject = false;
    Token.TNumber.prototype.isWildcard = false;

    //
    //  ## TString(x)
    //
    //  Constructor to represent the string token with a value, `x`.
    //
    Token.TString.prototype.isIdent = false;
    Token.TString.prototype.isNumber = false;
    Token.TString.prototype.isString = true;
    Token.TString.prototype.isObject = false;
    Token.TString.prototype.isWildcard = false;

    //
    //  ## TObject(x)
    //
    //  Constructor to represent the object token with a value, `x`.
    //
    Token.TObject.prototype.isIdent = false;
    Token.TObject.prototype.isNumber = false;
    Token.TObject.prototype.isString = false;
    Token.TObject.prototype.isObject = true;
    Token.TObject.prototype.isWildcard = false;

    //
    //  ## TWildcard(x)
    //
    //  Constructor to represent the wildcard token.
    //
    Token.TWildcard.isIdent = false;
    Token.TWildcard.isNumber = false;
    Token.TWildcard.isString = false;
    Token.TWildcard.isObject = false;
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
