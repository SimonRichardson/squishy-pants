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

Parser.put = function(a) {
    return Parser(function() {
        return a;
    });
};

Parser.regexp = function(r) {
    return Parser(function(stream, index, attempt) {
    });
};

Parser.string = function(value) {
    var length = value.length;

    return Parser(function(stream, index, attempt) {
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index, attempt) {
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
            function(x) {

            },
            bounce(arguments)
        );
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, attempt) {
    });
};

Parser.prototype.orElse = function(alt) {
    var env = this;
    return Parser(function(stream, index, attempt) {
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index, attempt) {
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

var eof = Parser(function(stream, index, attempt) {
    var outcome = (index < stream.length) ? attempt : Attempt.Failure(['EOF']);
    return Tuple3(stream, index, outcome);
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
