var Parser = tagged('Parser', ['run']);

Parser.of = function(a) {
    return Parser(function() {
        return a;
    });
};

Parser.regexp = function(r) {
    return Parser(function(stream, index) {
        var match = r.exec(stream.slice(index));
        return match[0];
    });
};

Parser.prototype.chain = function(f) {
    var env = this;
    return Parser(function(e) {
        return f(env.run(e)).run(e);
    });
};

Parser.prototype.map = function(f) {
    return this.chain(function(a) {
        return Parser.of(f(a));
    });
};

Parser.prototype.orElse = function(f) {
    var env = this;
    return Parser(function(e) {
        return f(e);
    });
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
