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
        return Tuple3(a, b, Attempt.Failure(e));
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
        var value = stream.slice(index, index + length),
            match = a.exec(value);
        return Option.toOption(match).fold(
            function(x) {
                var result = x[0];
                return Tuple3(stream, index + result.length, Attempt.of(result));
            },
            function() {
                return Tuple3(stream, index, Attempt.Failure([value, index]));
            }
        );
    });
};

Parser.string = function(a) {
    var length = a.length;
    return Parser(function(stream, index, attempt) {
        var value = stream.slice(index, index + length);
        return Option.toOption(value === a).fold(
            function() {
                return Tuple3(stream, index + length, Attempt.of(value));
            },
            function() {
                return Tuple3(stream, index, Attempt.Failure([value, index]));
            }
        );
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index, attempt) {
        var outcome = env.run(stream, index, attempt);
        return outcome.fold(
            function(x) {
                var a = f(x);
                return a.run(
                    bounce(a.toArray()),
                    bounce(outcome.toArray())
                );
            },
            bounce(arguments)
        );
    });
};

Parser.prototype.many = function() {
    var env = this,
        rec = function(stream, index, attempt) {
            return attempt.fold(
                function(x) {
                    var outcome = env.run(stream, index, attempt);
                    return outcome._3.fold(
                        function(y) {
                            var values = squishy.concat(x, y);
                            return rec(stream, outcome._2, Attempt.of(values));
                        },
                        bounce(arguments)
                    );
                },
                bounce(arguments)
            );
        };
    return Parser(function(stream, index, attempt) {
        var outcome = rec(stream, index, attempt);
        return outcome._3.fold(
            constant(outcome),
            bounce(arguments)
        );
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, attempt) {
        return attempt.fold(
            function(x) {
                var outcome = Attempt.of(f(x));
                return Parser.put(Tuple3(stream, index, outcome));
            },
            bounce(arguments)
        );
    });
};

Parser.prototype.orElse = function(a) {
    var env = this;
    return Parser(function(stream, index, attempt) {
        var outcome = env.run(stream, index, attempt);
        return attempt.fold(
            bounce(arguments),
            function() {
                return a.run(outcome._1, outcome._2, outcome._3);
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
    var outcome = Option.toOption(index < stream.length);
    return Tuple3(stream, index, outcome.fold(
        constant(attempt),
        function() {
            return Attempt.Failure(['EOF']);
        }
    ));
});

var bounce = function(args) {
    var values = [].slice.call(args);
    return function() {
        return Tuple3.of.apply(this, values);
    };
};

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
