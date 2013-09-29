var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function a() {
        return Tuple3(a, 0, Attempt.of([]));
    });
};

Parser.put = function(a) {
    return Parser(function b() {
        return a;
    });
};

Parser.regexp = function(r) {
    return Parser(function c(stream, index, result) {
        var sliced = stream.slice(index),
            match = r.exec(sliced),
            extract = result.match({
                Success: identity,
                Failure: identity
            }),
            matched,
            length,
            value;

        if (match) {
            value = match[0];
            length = value.length;

            matched = result.match({
                Success: function(x) {
                    return Attempt.of(squishy.concat(extract, [value]));
                },
                Failure: constant(result)
            });
        } else {
            length = 0;
            matched = Attempt.Failure(squishy.concat(extract, [[sliced, index]]));
        }

        return Tuple3(stream, index + length, matched);
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function c1(stream, index, result) {
        var a = env.run(stream, index, result);

        return a._3.match({
            Success: function c2(x) {

                var next = f(a._1, a._2, a._3);

                return next.run(a._1, a._2, result.match({
                    Success: function c3(y) {
                        return squishy.concat(y, x);
                    },
                    Failure: identity
                }));
            },
            Failure: function c4(x) {
                var next = f(a._1, a._2, a._3);
                return next.run(a._1, a._2, a._3);
            }
        });
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function m1(stream, index, result) {
        return result.match({
            Success: function m2(x) {
                var numOfLast = x.length - 1,
                    outcome,
                    lens;

                if (numOfLast < 0) {
                    return Parser.put(Tuple3(stream, index, result));
                } else {

                    lens = Lens.arrayLens(numOfLast).run(x);
                    outcome = lens.set(f(lens.get()));

                    return Parser.put(Tuple3(stream, index, Attempt.of(outcome)));
                }
            },
            Failure: function m5(x) {
                return Parser.put(Tuple3(stream, index, result));
            }
        });
    });
};

Parser.prototype.orElse = function(a) {
    var env = this;
    return this.chain(function o1(stream, index, result) {
        return result.match({
            Success: function() {
                return Parser.put(Tuple3(stream, index, result));
            },
            Failure: function(x) {
                var outcome = a.run(stream, index, Attempt.of(x.slice(0, x.length - 2)));
                return Parser.put(Tuple3(outcome._1, outcome._2, outcome._3));
            }
        });
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function f(stream, index, result) {
        var outcome = a.run(stream, index, result);
        return Parser.put(Tuple3(outcome._1, outcome._2, result));
    });
};

Parser.prototype.parse = function g(stream) {
    return this.skip(eof).run(stream, 0, Attempt.of([]))._3;
};

var eof = Parser(function(stream, index, result) {
    // We need to rebounce everything from here, until null
    var attempt = (index < stream.length) ? result : Attempt.Failure(['EOF']);
    return Tuple3(stream, index, attempt);
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
