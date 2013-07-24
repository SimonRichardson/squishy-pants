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

Lens.prototype.andThen = function(b) {
    return b.compose(this);
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