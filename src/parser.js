var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function() {
        return Tuple3(a, 0, ['']);
    });
};

Parser.put = function(a) {
    return Parser(function() {
        return a;
    });
};

Parser.regexp = function(r) {
    return Parser(function(stream, index) {
        var match = r.exec(stream.slice(index)),
            result = match[0];

        return Tuple3(stream, index + result.length, [result]);
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index, result) {
        var a = env.run(stream, index, result),
            b = f(a._1, a._2, a._3);

        return b.run(a._1, a._2, squishy.concat(result, a._3));
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index, result) {
        var numOfLast = result.length - 1,
            lens = Lens.arrayLens(numOfLast).run(result),
            outcome = lens.set(f(result[numOfLast]));

        return Parser.put(Tuple3(stream, index, outcome));
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index, result) {
        return a.run(stream, index, result);
    });
};

Parser.prototype.parse = function(a) {
    return this.skip(eof).run(a, 0, [])._3;
};

var eof = Parser(function(stream, index, result) {
    return Parser(function() {
        var a = index < stream.length ? stream : null;
        return Tuple3(a, index, result);
    });
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
