
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

//
//  ### chain(f)
//
//  Bind through the value of the `ReaderT` transformer
//  Monadic flatMap/bind
//
ReaderT.prototype.chain = function(f) {
    var env = this;
    return ReaderT(function(a) {
        return env.run(a).chain(function(b) {
            return f(b).run(a);
        });
    });
};

//
//  ### map(f)
//
//  Map on the value of this `ReaderT`.
//  Functor map
//
ReaderT.prototype.map = function(f) {
    return this.chain(function(a) {
        return ReaderT.of(f(a));
    });
};

//
//  ## ReaderT(m)
//
//  `ReaderT` constructor passing in a monad type.
//
Reader.ReaderT = function(monad) {

    //
    //  ## ask()
    //
    //  Construct `ask` to retrieve the `ReaderT` value.
    //
    ReaderT.ask = ReaderT(function(a) {
        return monad.of(a);
    });

    //
    //  ## lift(m)
    //
    //  Construct `lift` Monad creating a `ReaderT`.
    //
    ReaderT.lift = function(m) {
        return ReaderT(function(b) {
            return m;
        });
    };

    //
    //  ## of(x)
    //
    //  Construct `of` Monad creating a `ReaderT`.
    //
    ReaderT.of = function(a) {
        return ReaderT(function(b) {
            return monad.of(a);
        });
    };

    return ReaderT;
};

//
//  ## isReaderT(a)
//
//  Returns `true` if `a` is `ReaderT`.
//
var isReaderT = isInstanceOf(ReaderT);

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
fo.unsafeSetValueOf(ReaderT.prototype);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('ReaderT', ReaderT)
    .property('isReaderT', isReaderT)
    .property('readerTOf', readerTOf)
    .property('isReaderTOf', isReaderTOf)
    .method('of', strictEquals(ReaderT), function(x, y) {
        return Reader.ReaderT(b).of(c);
    })
    .method('arb', isReaderTOf, function(a, b) {
        return Reader.ReaderT(this.arb(a.type, b - 1));
    })
    .method('chain', isReaderT, function(a, b) {
        return a.chain(b);
    })
    .method('map', isReaderT, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isReaderT, function(a, b) {
        return [];
    });
