//
//  ## Store(set, get)
//
//  * `extract()` - Extracting value returning new
//  * `extend(f)` - Monadic flatMap/bind
//  * `map(f)` - Functor map
//
var Store = tagged('Store', ['set', 'get']);

//
//  ### extract()
//
//  Extract the value and sets a new value.
//
Store.prototype.extract = function() {
    return this.set(this.get());
};

//
//  ### expand(f)
//
//  Extend the store value with the result from f, chaining stores together.
//
Store.prototype.expand = function(f) {
    var env = this;
    return Store(
        function(k) {
            return f(Store(
                env.set,
                function() {
                    return k;
                }
            ));
        },
        this.get
    );
};

//
//  ### map(f)
//
//  Returns a new state that evaluates `f` on a value and passes it through.
//
Store.prototype.map = function(f) {
    return this.expand(function(c) {
        return f(c.extract());
    });
};

//
//  ## isStore(a)
//
//  Returns `true` if `a` is `Store`.
//
var isStore = isInstanceOf(Store);

//
//  ## storeOf(type)
//
//  Sentinel value for when an store of a particular type is needed:
//
//       storeOf(Number)
//
function storeOf(type) {
    var self = getInstance(this, storeOf);
    self.type = type;
    return self;
}

//
//  ## isStoreOf(a)
//
//  Returns `true` if `a` is an instance of `storeOf`.
//
var isStoreOf = isInstanceOf(storeOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Store.prototype);

//
//  ### lens
//
//  Lens access for an state structure.
//
Store.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return Store(
                    identity,
                    constant(s)
                );
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
    .property('Store', Store)
    .property('storeOf', storeOf)
    .property('isStore', isStore)
    .property('isStoreOf', isStoreOf)
    .method('expand', isStore, function(a, b) {
        return a.expand(b);
    })
    .method('extract', isStore, function(a) {
        return a.extract();
    })
    .method('map', isStore, function(a, b) {
        return a.map(b);
    })
    .method('arb', isStoreOf, function(a, b) {
        var value = this.arb(a.type, b - 1);
        return Store(
            identity,
            constant(value)
        );
    })
    .method('shrink', isStore, function(a, b) {
        return [];
    });
