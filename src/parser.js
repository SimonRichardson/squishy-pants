var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function a() {
        return Tuple3(a, 0, []);
    });
};

Parser.put = function(a) {
    return Parser(function b() {
        return a;
    });
};

Parser.regexp = function(r) {
    return Parser(function c(stream, index, result) {
        var match = r.exec(stream.slice(index)),
            matched = match ? [match[0]] : [],
            length = match ? match[0].length : 0;

        return Tuple3(stream, index + length, squishy.concat(result, matched));
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function d(stream, index, result) {
        var a = env.run(stream, index, result),
            b = f(a._1, a._2, a._3);

        return b.run(a._1, a._2, squishy.concat(result, a._3));
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function e(stream, index, result) {
        var numOfLast = result.length - 1,
            lens = Lens.arrayLens(numOfLast).run(result),
            outcome = lens.set(f(lens.get()));

        return Parser.put(Tuple3(stream, index, outcome));
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function f(stream, index, result) {
        var outcome = a.run(stream, index, result);
        return Parser.put(Tuple3(outcome._1, outcome._2, result));
    });
};

Parser.prototype.parse = function g(stream) {
    return this.skip(eof).run(stream, 0, [])._3;
};

var eof = Parser(function(stream, index, result) {
    var a = index < stream.length ? stream : null;
    return Tuple3(a, index, result);
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
