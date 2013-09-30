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
            value;

        if (match) {
            value = match[0];

            return Tuple4(stream, index + value.length, result, Attempt.of([value]));
        } else {
            return Tuple4(stream, index, result, Attempt.Failure([[sliced, index]]));
        }
    });
};

Parser.string = function(value) {
    return Parser(function(stream, index, result, attempt) {
        var length = value.length,
            sliced = stream.slice(index, index + length);

        if (sliced === value) {
            return Tuple4(stream, index + length, result, Attempt.of([sliced]));
        } else {
            return Tuple4(stream, index, result, Attempt.Failure([[sliced, index]]));
        }
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index, result, attempt) {
        var a = env.run(stream, index, result, attempt);
        return a._4.match({
            Success: function(x) {
                var values = squishy.concat(a._3, x),
                    next = f(a._1, a._2, values, a._4);
                return next.run(a._1, a._2, values, attempt);
            },
            Failure: function(x) {
                return a;
            }
        });
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, result, attempt) {
        return attempt.match({
            Success: function(x) {
                var numOfLast = result.length - 1,
                    values = numOfLast < 0 ? result : result.slice(0, numOfLast),
                    outcome = Attempt.of(f(x));

                return Parser.put(Tuple4(stream, index, values, outcome));
            },
            Failure: function(x) {
                return Parser.put(Tuple4(stream, index, result, attempt));
            }
        });
    });
};

Parser.prototype.orElse = function(a) {
    var env = this;
    return this.chain(function(stream, index, result, attempt) {
        return attempt.match({
            Success: function() {
                return Parser.put(Tuple4(stream, index, result, attempt));
            },
            Failure: function(x) {
                var outcome = a.run(stream, index, result, Attempt.of(x.slice(0, x.length - 2)));
                return Parser.put(Tuple4(outcome._1, outcome._2, result, outcome._4));
            }
        });
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index, result, attempt) {
        var outcome = a.run(stream, index, result, attempt);
        return Parser.put(Tuple4(outcome._1, outcome._2, result, Attempt.of([])));
    });
};

Parser.prototype.parse = function(stream) {
    var result = this.skip(eof).run(stream, 0, [], Attempt.of([]));
    return result._4.match({
        Success: function() {
            return Attempt.of(result._3);
        },
        Failure: constant(result._4)
    });
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
