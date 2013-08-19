//
//  ## Reader(run)
//
//
var Reader = tagged('Reader', ['run']);

Reader.ask = Reader(function(e) {
    return e;
});

Reader.of = function(a) {
    return Reader(function(e) {
        return a;
    });
};

Reader.empty = function() {
    return Reader(nothing);
};

Reader.prototype.ap = function(a) {
    return this.flatMap(function(f) {
        return a.map(f);
    });
};

Reader.prototype.flatMap = function(f) {
    var reader = this;
    return Reader(function(e) {
        return f(reader.run(e)).run(e);
    });
};

Reader.prototype.map = function(f) {
    return this.flatMap(function(a) {
        return Reader.of(f(a));
    });
};

//
//  ## isReader(a)
//
//  Returns `true` if `a` is `Reader`.
//
var isReader = isInstanceOf(Reader);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Reader', Reader)
    .property('isReader', isReader)
    .method('of', strictEquals(Reader), function(x) {
        return Reader.of(x);
    })
    .method('empty', strictEquals(Reader), function() {
        return Reader.empty();
    })
    .method('flatMap', isReader, function(a, b) {
        return a.flatMap(b);
    })
    .method('map', isReader, function(a, b) {
        return a.map(b);
    })
    .method('arb', isReader, function(a, b) {
        return Reader.of(this.arb(AnyVal, b - 1));
    });
