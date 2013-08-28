//
//  ## Reader(run)
//
//  Reader represents a computation, which can read values, passes values from
//  function to functions.
//
//   * `ap(b, concat)` - Applicative ap(ply)
//   * `flatMap(f)` - Monadic flatMap/bind
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
    return Reader(nothing);
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the value of this reader
//  Applicative ap(ply)
//
Reader.prototype.ap = function(a) {
    return this.flatMap(function(f) {
        return squishy.map(a, f);
    });
};

//
//  ### flatMap(f)
//
//  Bind through the value of the reader
//  Monadic flatMap/bind
//
Reader.prototype.flatMap = function(f) {
    var env = this;
    return Reader(function(e) {
        return f(env.run(e)).run(e);
    });
};

//
//  ### map(f)
//
//  Map on the value of this reader.
//  Functor map
//
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
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Reader', Reader)
    .property('readerOf', readerOf)
    .property('isReader', isReader)
    .property('isReaderOf', isReaderOf)
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
    .method('arb', isReaderOf, function(a, b) {
        return Reader.of(this.arb(a.type, b - 1));
    })
    .method('shrink', isReader, function(a, b) {
        return [];
    });
