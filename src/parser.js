var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function() {
        return Tuple2(a, 0);
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

        return Tuple2(result, index + result.length);
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(stream, index) {
        var a = env.run(stream, index),
            b = f(a._1, a._2);

        return b.run(a._1, a._2);
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(stream, index) {
        return Parser.put(Tuple2(f(stream), index));
    });
};

Parser.prototype.skip = function(a) {
    return this.chain(function(stream, index) {
        return a.run(stream, index);
    });
};

Parser.prototype.parse = function(a) {
    return this.skip(eof).run(a, 0)._1;
};

var eof = Parser(function(stream, index) {
    return Parser(function() {
        var result = index < stream.length ? stream : null;

        return Tuple2(result, index);
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
