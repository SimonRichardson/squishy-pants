var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function() {
        return Tuple3(a, 0, Attempt.of([]));
    });
};

Parser.empty = function() {
    return Parser(function(a) {
        return Tuple3(a, 0, Attempt.of([]));
    });
};

Parser.fail = function(e) {
    return Parser(function(a, b) {
        return Tuple3(a, b, Attempt.Failure([e]));
    });
};

Parser.success = function(s) {
    return Parser(function(a, b) {
        return Tuple3(a, b, Attempt.of(s));
    });
};

Parser.put = function(a) {
    return Parser(function() {
        return a;
    });
};

Parser.regexp = function(a) {
    return Parser(function(stream, index, attempt) {
        var value = stream.slice(index),
            match = a.exec(value),
            result;
        if(match) {
            result = match[0];
            return Tuple3(stream, index + result.length, Attempt.of([result]));
        } else {
            return Tuple3(stream, index, Attempt.Failure([[value, index]]));
        }
    });
};

Parser.string = function(a) {
    var length = a.length;
    return Parser(function(stream, index, attempt) {
        var value = stream.slice(index, index + length);
        if (value === a) {
            return Tuple3(stream, index + length, Attempt.of([value]));
        } else {
            return Tuple3(stream, index, Attempt.Failure([[value, index]]));
        }
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index, attempt) {
        var outcome = env.run(stream, index, attempt);
        return outcome._3.fold(
            function(x) {
                var a = f(outcome._1, outcome._2, outcome._3);
                return a.run(outcome._1, outcome._2, outcome._3);
            },
            function() {
                return Tuple3(outcome._1, outcome._2, outcome._3);
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
                        var outcome = env.run(stream, index, attempt);
                        return outcome._3.fold(
                            function(x) {
                                var y = squishy.concat(values, x);
                                return rec(outcome._2, outcome._3, y);
                            },
                            function() {
                                return Tuple2(index, values);
                            }
                        );
                    },
                    function() {
                        return Tuple2(index, values);
                    }
                );
            };
        };
    return Parser(function(stream, index, attempt) {
        var outcome = recursive(stream)(index, attempt, []);
        return Tuple3(stream, outcome._1, Attempt.of([outcome._2]));
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, attempt) {
        return attempt.fold(
            function(x) {
                return Parser.put(Tuple3(stream, index, Attempt.of(f(x))));
            },
            function() {
                return Parser.put(Tuple3(stream, index, attempt));
            }
        );
    });
};

Parser.prototype.orElse = function(a) {
    var env = this;
    return Parser(function(stream, index, attempt) {
        var outcome = env.run(stream, index, attempt);
        return outcome._3.fold(
            function() {
                return outcome;
            },
            function() {
                return a.run(stream, index, attempt);
            }
        );
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index, attempt) {
        return a.chain(function() {
            return Parser(function(stream, index) {
                return Tuple3(stream, index, attempt);
            });
        });
    });
};

Parser.prototype.parse = function(stream) {
    var result = this.skip(eof).run(stream, 0, Attempt.of([]));
    return result._3;
};

var eof = Parser(function(stream, index, attempt) {
    var outcome = index <= stream.length ? attempt : Attempt.Failure(['EOF', index]);
    return Tuple3(stream, index, outcome);
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
