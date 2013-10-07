var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function() {
        return Tuple4(a, 0, Attempt.of([]), Option.None);
    });
};

Parser.empty = function() {
    return Parser(function(a) {
        return Tuple4(a, 0, Attempt.of([]), Option.None);
    });
};

Parser.fail = function(e) {
    return Parser(function(a, b) {
        return Tuple4(a, b, Attempt.Failure([e]), Option.of([e]));
    });
};

Parser.success = function(s) {
    return Parser(function(a, b) {
        return Tuple4(a, b, Attempt.of(s), Option.None);
    });
};

Parser.put = function(a) {
    return Parser(function() {
        return a;
    });
};

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

Parser.prototype.many = function() {
    var env = this,
        recursive = function(stream) {
            return function rec(index, attempt, values) {
                return attempt.fold(
                    function() {
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
                    },
                    function() {
                        return Tuple3(index, values, attempt);
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

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, attempt, possibleFailure) {
        return attempt.fold(
            function(x) {
                return Parser.put(Tuple4(stream, index, Attempt.of(f(x)), possibleFailure));
            },
            function() {
                return Parser.put(Tuple4(stream, index, attempt, possibleFailure));
            }
        );
    });
};

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

Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index, attempt, possibleFailure) {
        return a.chain(function() {
            return Parser(function(stream, index, _, d) {
                return Tuple4(stream, index, attempt, possibleFailure);
            });
        });
    });
};

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
    .property('Parser', Parser);
