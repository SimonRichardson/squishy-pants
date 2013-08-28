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
//  ### extend(f)
//
//  Extend the store value with the result from f, chaining stores together.
//
Store.prototype.extend = function(f) {
    var env = this;
    return Store(
        function(k) {
            env.set(f(Store(
                env.set,
                constant(k)
            )));
            return env.get();
        },
        function() {
            return env.get();
        }
    );
};

//
//  ### map(f)
//
//  Returns a new state that evaluates `f` on a value and passes it through.
//
Store.prototype.map = function(f) {
    var self = this;
    return this.extend(function(c) {
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
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Store', Store)
    .property('isStore', isStore)
    .method('extract', isStore, function(a) {
        return a.extract();
    })
    .method('map', isStore, function(a, b) {
        return a.map(b);
    })
    .method('arb', isStore, function(a, b) {
        var value = this.arb(AnyVal, b - 1);
        return Store(
            identity,
            constant(value)
        );
    });
