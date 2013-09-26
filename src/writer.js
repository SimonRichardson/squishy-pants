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
        return Tuple2(a, '');
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
//  ## Writer Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//  * `ap(a)` - applicative ap(ply)
//

var WriterT = tagged('WriterT', ['run']);

Writer.WriterT = transformer(WriterT);

//
//  ## isWriterT(a)
//
//  Returns `true` if `a` is `WriterT`.
//
var isWriterT = isInstanceOf(WriterT);

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
//  ## writerTOf(type)
//
//  Sentinel value for when an writer of a particular type is needed:
//
//       writerTOf(Number)
//
function writerTOf(type) {
    var self = getInstance(this, writerTOf);
    self.type = type;
    return self;
}

//
//  ## isWriterTOf(a)
//
//  Returns `true` if `a` is an instance of `writerTOf`.
//
var isWriterTOf = isInstanceOf(writerTOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Writer.prototype);

//
//  ### lens
//
//  Lens access for an state structure.
//
Writer.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return Writer(s);
            },
            function() {
                return a.run;
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Writer', Writer)
    .property('WriterT', WriterT)
    .property('writerOf', writerOf)
    .property('writerTOf', writerTOf)
    .property('isWriter', isWriter)
    .property('isWriterT', isWriterT)
    .property('isWriterOf', isWriterOf)
    .property('isWriterTOf', isWriterTOf)
    .method('of', strictEquals(Writer), function(x) {
        return Writer.of(x);
    })
    .method('empty', strictEquals(Writer), function(x) {
        return Writer.empty();
    })

    .method('arb', isWriterOf, function(a, b) {
        return Writer.of(this.arb(a.type, b - 1));
    })
    .method('arb', isWriterTOf, function(a, b) {
        return Writer.WriterT(this.arb(writerOf(a.type), b - 1));
    })

    .method('ap', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
        return a.ap(b);
    })
    .method('chain', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
        return a.chain(b);
    })
    .method('map', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
        return a.map(b);
    })
    .method('shrink', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
        return [];
    });
