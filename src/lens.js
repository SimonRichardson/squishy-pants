var Lens = tagged('Lens', ['run']);

Lens.identityLens = function() {
    return Lens(function(target) {
        return Store(
            identity,
            function() {
                return target;
            }
        );
    });
};

Lens.objectLens = function(property) {
    return Lens(function(o) {
        return Store(
            function(s) {
                return extend(o, singleton(property, s));
            },
            function() {
                return o[property];
            }
        );
    });
};

Lens.arrayLens = function(index) {
    return Lens(function(a) {
        return Store(
            function(s) {
                var m = a.slice();
                m[index] = s;
                return m;
            },
            function() {
                return a[index];
            }
        );
    });
};

Lens.parse = function(s) {
    return squishy.fold(s.split('.'), Lens.identityLens(), function(a, b) {
        return a.andThen(Lens.objectLens(b));
    });
};

Lens.prototype.andThen = function(b) {
    return b.compose(this);
};

Lens.prototype.compose = function(b) {
    var a = this;
    return Lens(function(target) {
        var c = b.run(target),
            d = a.run(c.get());

        return Store(
            compose(c.set, d.set),
            d.get
        );
    });
};

//
//  ## isLens(a)
//
//  Returns `true` if `a` is `Lens`.
//
var isLens = isInstanceOf(Lens);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Lens', Lens)
    .property('isLens', isLens);