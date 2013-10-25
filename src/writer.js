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
    return Writer(function() {
        return Tuple2(null, '');
    });
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
    return this.chain(function(f) {
        return squishy.map(a, function(b) {
            return f(b);
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
            b = f(a._1).run(a._1);

        return Tuple2(b._1, squishy.concat(a._2, b._2));
    });
};

//
//  ### extract()
//
//  Executes a writer to get a value.
//
Writer.prototype.extract = function(a) {
    return this.run(a);
};

//
//  ### map(f)
//
//  Map on the value of this writer.
//  Functor map
//
Writer.prototype.map = function(f) {
    return this.chain(function(a) {
        return Writer.of(f(a));
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
                return a;
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Writer', Writer)
    .property('writerOf', writerOf)
    .property('isWriter', isWriter)
    .property('isWriterOf', isWriterOf)
    .method('of', strictEquals(Writer), function(x, y) {
        return Writer.of(y);
    })
    .method('empty', strictEquals(Writer), function(x) {
        return Writer.empty();
    })
    .method('arb', isWriterOf, function(a, b) {
        return Writer.of(this.arb(a.type, b - 1));
    })
    .method('ap', isWriter, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isWriter, function(a, b) {
        return a.chain(b);
    })
    .method('extract', isWriter, function(a, b) {
        return a.extract(b);
    })
    .method('map', isWriter, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isWriter, function(a, b) {
        return [];
    });
