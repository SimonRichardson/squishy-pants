//
//  ## Store(set, get)
//
//
var Store = tagged('Store', ['set', 'get']);

Store.prototype.extract = function() {
    return this.set(this.get());
};

Store.prototype.extend = function(f) {
    var self = this;
    return Store(
        function(k) {
            return f(Store(
                self.set,
                function() {
                    return k;
                }
            ));
        },
        this.get
    );
};

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