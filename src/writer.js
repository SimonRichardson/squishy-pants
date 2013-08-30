//
//   ## Writer(run)
//
//  Writer represents a computation, which can write values, passes values from
//  function to functions.
//
//   * `ap(b, concat)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `map(f)` - Functor map
//
var Writer = tagged('Writer', ['run']);

//
//  ## of(x)
//
//  Constructor `of` Monad creating a `Writer`.
//
Writer.of = function(a) {
    return Writer(function() {
        return Tuple2(a, null);
    });
};

//
//  ## empty()
//
//  Constructor `empty` Monad creating a `Writer`.
//
Writer.empty = function() {
    return Writer(nothing);
};

//
//  ## put()
//
//  Constructor `put` to return the value of `t`.
//
Writer.put = function(t) {
    return Writer(function() {
        return t;
    });
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of this writer
//  Applicative ap(ply)
//
Writer.prototype.ap = function(a) {
    return this.chain(function(tup) {
        return squishy.map(a, function(val) {
            return Tuple2(tup._1(val._1), val._2);
        });
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the writer
//  Monadic flatMap/bind
//
Writer.prototype.chain = function(f) {
    var env = this;
    return Writer(function(e) {
        var a = env.run(e),
            b = f(a).run(e);

        return Tuple2(b._1, squishy.concat(a._2, b._2));
    });
};

//
//  ### map(f)
//
//  Map on the value of this writer.
//  Functor map
//
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
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Writer.prototype);

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
