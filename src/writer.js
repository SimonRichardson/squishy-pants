//
//   ## Writer(run)
//
var Writer = tagged('Writer', ['run']);

Writer.of = function(a) {
    return Writer(function() {
        return Tuple2(a, null);
    });
};

Writer.empty = function() {
    return Writer(nothing);
};

Writer.put = function(t) {
    return Writer(function() {
        return t;
    });
};

Writer.prototype.ap = function(a) {
    return this.chain(function(tup) {
        return squishy.map(a, function(val) {
            return Tuple2(tup._1(val._1), val._2);
        });
    });
};

Writer.prototype.chain = function(f) {
    var env = this;
    return Writer(function(e) {
        var a = env.run(e),
            b = f(a).run(e);

        return Tuple2(b._1, squishy.concat(a._2, b._2));
    });
};

Writer.prototype.map = function(f) {
    return this.chain(function(a) {
        return Writer.put(f(a));
    });
};

//
//  ## isWriter(a)
//
//  Returns `true` if `a` is `Writer`.
//
var isWriter = isInstanceOf(Writer);

//
//  ## writerOf(type)
//
//  Sentinel value for when an writer of a particular type is needed:
//
//       writerOf(Number)
//
function writerOf(type) {
    var self = getInstance(this, writerOf);
    self.type = type;
    return self;
}

//
//  ## isWriterOf(a)
//
//  Returns `true` if `a` is an instance of `writerOf`.
//
var isWriterOf = isInstanceOf(writerOf);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Writer', Writer)
    .property('writerOf', Writer)
    .property('isWriter', isWriter)
    .property('isWriterOf', isWriterOf)
    .method('of', strictEquals(Writer), function(x) {
        return State.of(x);
    })
    .method('ap', isWriter, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isWriter, function(a, b) {
        return a.chain(b);
    })
    .method('map', isWriter, function(a, b) {
        return a.map(b);
    })
    .method('arb', isWriterOf, function(a, b) {
        return Writer.of(this.arb(a.type, b - 1));
    })
    .method('shrink', isWriter, function(a, b) {
        return [];
    });
