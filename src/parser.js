var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function() {
        return Tuple4(a, 0, [], Attempt.of([]));
    });
};

Parser.empty = function() {
    return Parser(function(a) {
        return Tuple4(a, 0, [], Attempt.of([]));
    });
};

Parser.put = function(a) {
    return Parser(function() {
        return a;
    });
};

Parser.regexp = function(r) {
    return Parser(function(stream, index, result, attempt) {
        var sliced = stream.slice(index),
            match = r.exec(sliced),
            matched,
            length,
            errors,
            value;

        if (match) {
            value = match[0];

            return Tuple4(stream, index + value.length, result, Attempt.of([value]));
        } else {
            errors = [[sliced, index]];

            return Tuple4(stream, index, result, Attempt.Failure(attempt.fold(
                constant(errors),
                function(x) {
                    return squishy.concat(x, errors);
                }
            )));
        }
    });
};

Parser.string = function(value) {
    return Parser(function(stream, index, result, attempt) {
        var length = value.length,
            sliced = stream.slice(index, index + length),
            errors;

        if (sliced === value) {
            return Tuple4(stream, index + length, result, Attempt.of([sliced]));
        } else {
            errors = [[sliced, index]];

            return Tuple4(stream, index, result, Attempt.Failure(attempt.fold(
                constant(errors),
                function(x) {
                    return squishy.concat(x, errors);
                }
            )));
        }
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index, result, attempt) {
        var a = env.run(stream, index, result, attempt);
        return a._4.fold(
            function(x) {
                var values = squishy.concat(a._3, x),
                    next = f(a._1, a._2, values, a._4);
                return next.run(a._1, a._2, values, attempt);
            },
            constant(a)
        );
    });
};

Parser.prototype.many = function() {
    var env = this;
    return this.chain(function(stream, index, result, attempt) {
        var outcome = attempt,
            values = result,
            expr;

        // TODO: Make this recursive!
        while(true) {
            expr = env.run(stream, index, values, outcome);
            outcome = expr._4;

            if (outcome.isFailure) {
                break;
            }

            values = expr._3;
            index += 1;
        }

        return Parser.put(Tuple4(stream, index, values, Attempt.of([])));
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, result, attempt) {
        return attempt.fold(
            function(x) {
                var numOfLast = result.length - 1,
                    values = numOfLast < 0 ? result : result.slice(0, numOfLast),
                    outcome = Attempt.of(f(x));

                return Parser.put(Tuple4(stream, index, values, outcome));
            },
            function(x) {
                return Parser.put(Tuple4(stream, index, result, attempt));
            }
        );
    });
};

Parser.prototype.orElse = function(alt) {
    var env = this;
    return Parser(function(stream, index, result, attempt) {
        var a = env.run(stream, index, result, attempt);
        return a._4.fold(
            function(x) {
                var values = squishy.concat(a._3, x);
                return Tuple4(a._1, a._2, values, Attempt.of([]));
            },
            function(x) {
                var outcome = alt.run(stream, index, result, Attempt.of([]));
                return outcome;
            }
        );
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index, result, attempt) {
        return attempt.fold(
            function(x) {
                var outcome = a.run(stream, index, result, attempt);
                return Parser.put(Tuple4(stream, outcome._2, result, Attempt.of([])));
            },
            function(x) {
                return Parser.put(Tuple4(stream, index, result, attempt));
            }
        );
    });
};

Parser.prototype.parse = function(stream) {
    var result = this.skip(eof).run(stream, 0, [], Attempt.of([]));
    return result._4.fold(
        function() {
            return Attempt.of(result._3);
        },
        constant(result._4)
    );
};

var eof = Parser(function(stream, index, result, attempt) {
    var outcome = (index < stream.length) ? attempt : Attempt.Failure(['EOF']);
    return Tuple4(stream, index, result, outcome);
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
