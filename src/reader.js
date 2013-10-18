//
//  ## Reader(run)
//
//  Reader represents a computation, which can read values, passes values from
//  function to functions.
//
//   * `ap(b, concat)` - Applicative ap(ply)
//   * `chain(f)` - Monadic flatMap/bind
//   * `map(f)` - Functor map
//
var Reader = tagged('Reader', ['run']);

//
//  ## ask(x)
//
//  Constructs a `Reader` from the current value.
//
Reader.ask = Reader(function(e) {
    return e;
});

//
//  ## of(x)
//
//  Constructor `of` Monad creating a `Reader`.
//
Reader.of = function(a) {
    return Reader(function(e) {
        return a;
    });
};

//
//  ## empty()
//
//  Constructor `empty` Monad creating a `Reader`.
//
Reader.empty = function() {
    return Reader(constant(null));
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of this reader
//  Applicative ap(ply)
//
Reader.prototype.ap = function(a) {
    return this.chain(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### chain(f)
//
//  Bind through the value of the reader
//  Monadic flatMap/bind
//
Reader.prototype.chain = function(f) {
    var env = this;
    return Reader(function(e) {
        return f(env.run(e)).run(e);
    });
};

//
//  ### extract()
//
//  Executes a reader to get a value.
//
Reader.prototype.extract = function(a) {
    return this.run(a);
};

//
//  ### map(f)
//
//  Map on the value of this reader.
//  Functor map
//
Reader.prototype.map = function(f) {
    return this.chain(function(a) {
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
//  ## Reader Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//  * `ap(a)` - applicative ap(ply)
//

var ReaderT = tagged('ReaderT', ['run']);

Reader.ReaderT = transformer(ReaderT);

//
//  ## isReaderT(a)
//
//  Returns `true` if `a` is `ReaderT`.
//
var isReaderT = isInstanceOf(ReaderT);

//
//  ## readerOf(type)
//
//  Sentinel value for when an reader of a particular type is needed:
//
//       readerOf(Number)
//
function readerOf(type) {
    var self = getInstance(this, readerOf);
    self.type = type;
    return self;
}

//
//  ## isReaderOf(a)
//
//  Returns `true` if `a` is an instance of `readerOf`.
//
var isReaderOf = isInstanceOf(readerOf);

//
//  ## readerTOf(type)
//
//  Sentinel value for when an reader of a particular type is needed:
//
//       readerTOf(Number)
//
function readerTOf(type) {
    var self = getInstance(this, readerTOf);
    self.type = type;
    return self;
}

//
//  ## isReaderTOf(a)
//
//  Returns `true` if `a` is an instance of `readerTOf`.
//
var isReaderTOf = isInstanceOf(readerTOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Reader.prototype);

//
//  ### lens
//
//  Lens access for an reader structure.
//
Reader.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return Reader(s);
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
    .property('Reader', Reader)
    .property('ReaderT', ReaderT)
    .property('readerOf', readerOf)
    .property('readerTOf', readerTOf)
    .property('isReader', isReader)
    .property('isReaderOf', isReaderOf)
    .property('isReaderTOf', isReaderTOf)
    .method('of', strictEquals(Reader), function(x, y) {
        return Reader.of(y);
    })
    .method('empty', strictEquals(Reader), function() {
        return Reader.empty();
    })

    .method('arb', isReaderOf, function(a, b) {
        return Reader.of(this.arb(a.type, b - 1));
    })
    .method('arb', isReaderTOf, function(a, b) {
        return Reader.ReaderT(this.arb(readerOf(a.type), b - 1));
    })

    .method('extract', isReader, function(a, b) {
        return a.extract(b);
    })

    .method('ap', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
        return a.ap(b);
    })
    .method('chain', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
        return a.chain(b);
    })
    .method('map', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
        return a.map(b);
    })
    .method('shrink', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
        return [];
    });
