//
//   # Parser
//
//   A monadic LL(infinity) parser.
//
//        var alpha = _.Parser.regexp(/^[a-zA-Z]+/),
//            number = _.Parser.regexp(/^[\+\-]?\d+(\.\d+)?/),
//            expr = alpha.orElse(number);
//        expr.parse('1.1');
//
//   * `chain(f)` - Monadic flatMap/bind
//   * `also(f)` - FlatMap/bind with concatenation of results
//   * `many` - Yield array of results
//   * `map(f)` - Functor map
//   * `orElse(a)` - Default parser or else try alternative
//   * `skip` - Skip the parser
//   * `parse` - Executes parser
//
var Parser = tagged('Parser', ['run']);

//
//  ### of(x)
//
//  Creates a parser that contains a successful value.
//
Parser.of = function(a) {
    return Parser(function() {
        return Tuple4(a, 0, Attempt.of([]), Option.None);
    });
};

//
//  ### empty()
//
//  Creates a parser that contains a empty value.
//
Parser.empty = function() {
    return Parser(function(a) {
        return Tuple4(a, 0, Attempt.of([]), Option.None);
    });
};

//
//  ### fail(x)
//
//  Creates a parser that contains a failed value.
//
Parser.fail = function(e) {
    return Parser(function(a, b) {
        return Tuple4(a, b, Attempt.Failure([e]), Option.of([e]));
    });
};

//
//  ### success(x)
//
//  Creates a parser that contains a successful value.
//
Parser.success = function(s) {
    return Parser(function(a, b) {
        return Tuple4(a, b, Attempt.of(s), Option.None);
    });
};

//
//  ### put(x)
//
Parser.put = function(a) {
    return Parser(function() {
        return a;
    });
};

//
//  ### regexp(x)
//
//  Parser that expects the stream to match the given regex.
//
Parser.regexp = function(a) {
    return Parser(function(stream, index, attempt, possibleFailure) {
        var value = stream.slice(index),
            match = a.exec(value),
            result;
        if(match) {
            result = match[0];
            return Tuple4(stream, index + result.length, Attempt.of([result]), possibleFailure);
        } else {
            return Tuple4(stream, index, Attempt.Failure([[value, index]]), possibleFailure);
        }
    });
};

//
//  ### string(x)
//
//  Parser that expects to find a string, and will yield the same.
//
Parser.string = function(a) {
    var length = a.length;
    return Parser(function(stream, index, attempt, possibleFailure) {
        var value = stream.slice(index, index + length);
        if (value === a) {
            return Tuple4(stream, index + length, Attempt.of([value]), possibleFailure);
        } else {
            return Tuple4(stream, index, Attempt.Failure([[value, index]]), possibleFailure);
        }
    });
};

//
//  ### chain(f)
//
//  Expects another Parser to follow parser, and yields the result of
//  another Parser.
//
Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index, attempt, possibleFailure) {
        var outcome = env.run(stream, index, attempt, possibleFailure);
        return outcome._3.fold(
            function(x) {
                var a = f(outcome._1, outcome._2, outcome._3, outcome._4);
                return a.run(outcome._1, outcome._2, outcome._3, outcome._4);
            },
            function() {
                return Tuple4(outcome._1, outcome._2, outcome._3, outcome._4);
            }
        );
    });
};

//
//  ### also(f)
//
//  Expects another Parser to follow parser, and concatenates the result of
//  both Parser results.
//
Parser.prototype.also = function(f) {
    var env = this;
    return Parser(function(stream, index, attempt, possibleFailure) {
        var outcome = env.run(stream, index, attempt, possibleFailure);
        return outcome._3.fold(
            function(x) {
                var a = f(outcome._1, outcome._2, outcome._3, outcome._4);
                var b = a.run(outcome._1, outcome._2, outcome._3, outcome._4);
                return b._3.fold(
                    function(y) {
                        var c = Attempt.of([squishy.concat(x[0], y)]);
                        return Tuple4(b._1, b._2, c, b._4);
                    },
                    function() {
                        return b;
                    }
                );
            },
            function() {
                return Tuple4(outcome._1, outcome._2, outcome._3, outcome._4);
            }
        );
    });
};

//
//  ### many()
//
//  Expects parser zero or more times, and yields an array of the results.
//
Parser.prototype.many = function() {
    var env = this,
        recursive = function(stream) {
            return function rec(index, attempt, values) {
                var outcome = env.run(stream, index, attempt, Option.None);
                return outcome._3.fold(
                    function(x) {
                        var y = squishy.concat(values, x);
                        return rec(outcome._2, outcome._3, y);
                    },
                    function() {
                        return Tuple3(index, values, outcome._3.fold(
                            constant(outcome._3),
                            function(x) {
                                return outcome._4.fold(
                                    function(y) {
                                        return Attempt.Failure(y);
                                    },
                                    function() {
                                        return Attempt.Failure(x);
                                    }
                                );
                            }
                        ));
                    }
                );
            };
        };
    return Parser(function(stream, index, attempt) {
        var outcome = recursive(stream)(index, attempt, []),
            possibleFailure = outcome._3.fold(
                Option.empty,
                Option.of
            );
        return Tuple4(stream, outcome._1, Attempt.of([outcome._2]), possibleFailure);
    });
};

//
//  ### map(f)
//
//  Transforms the output of parser with the given function.
//
Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, attempt, possibleFailure) {
        var x = f(attempt.value);
        return Parser.put(Tuple4(stream, index, Attempt.of(x), possibleFailure));
    });
};

//
//  ### orElse(a)
//
Parser.prototype.orElse = function(a) {
    var env = this;
    return Parser(function(stream, index, attempt, possibleFailure) {
        var outcome = env.run(stream, index, attempt, possibleFailure);
        return outcome._3.fold(
            function() {
                return outcome;
            },
            function() {
                var possible = a.run(stream, index, attempt, possibleFailure);
                return possible._3.fold(
                    function() {
                        return Tuple4(possible._1, possible._2, possible._3, possible._4);
                    },
                    function() {
                        return Tuple4(stream, index, outcome._3, outcome._4);
                    }
                );
            }
        );
    });
};

//
//  ### skip(a)
//
//  Returns a new parser which tries parser, and if it fails uses otherParser.
//
Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index, attempt, possibleFailure) {
        return a.chain(function() {
            return Parser(function(stream, index, _, d) {
                return Tuple4(stream, index, attempt, possibleFailure);
            });
        });
    });
};

//
//  ### parse(stream)
//
//  Executes the parser with the given stream.
//
Parser.prototype.parse = function(stream) {
    var result = this.skip(eof).run(stream, 0, Attempt.of([]), Option.None);
    return result._3.fold(
        constant(result._3),
        function(x) {
            return result._4.fold(
                function(y) {
                    return Attempt.Failure(y);
                },
                constant(result._3)
            );
        }
    );
};

//
//  ### eof()
//
//  Expects the end of the stream.
//
var eof = Parser(function(stream, index, attempt, possibleFailure) {
    var outcome = index <= stream.length ? attempt : Attempt.Failure(['EOF', index]);
    return Tuple4(stream, index, outcome, possibleFailure);
});

//
//  ## isParser(a)
//
//  Returns `true` if `a` is `Parser`.
//
var isParser = isInstanceOf(Parser);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Parser.prototype);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Parser', Parser)
    .property('isParser', isParser)
    .method('chain', isParser, function(a, b) {
        return a.chain(b);
    })
    .method('map', isParser, function(a, b) {
        return a.map(b);
    });
