//
//  ## Lens
//
//

var Lens = tagged('Lens', ['run']),
    PartialLens = tagged('PartialLens', ['run']);

function thisAndThen(b) {
    return b.compose(this);
}

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
        var access = squishy.fold(b.split('['), Lens.identityLens(), function(a, b) {
            var n = parseInt(b, 10);

            return a.andThen(
                (isNumber(n) && isNotNaN(n)) ?
                Lens.arrayLens(n) :
                   (isString(b) && squishy.isEmpty(b)) ?
                   Lens.identityLens() :
                   Lens.objectLens(b)
            );
        });

        return a.andThen(access);
    });
};

Lens.prototype.andThen = thisAndThen;

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

Lens.prototype.toPartial = function() {
    var self = this;
    return PartialLens(function(target) {
        return Option.Some(self.run(target));
    });
};

//
//  ## PartialLens
//
//

PartialLens.identityLens = function() {
    return PartialLens(function(target) {
        return Option.Some(Lens.id().run(target));
    });
};

PartialLens.objectLens = function(property) {
    var lens = Lens.objectLens(property);
    return PartialLens(function(target) {
        return property in target ?
                  Option.Some(lens.run(target)) :
                  Option.None;
    });
};

PartialLens.arrayLens = function(index) {
    var lens = Lens.arrayLens(index);
    return PartialLens(function(target) {
        return index >= 0 && index < target.length ?
                  Option.Some(lens.run(target)) :
                  Option.None;
    });
};

PartialLens.prototype.andThen = thisAndThen;

PartialLens.prototype.compose = function(b) {
    var a = this;
    return PartialLens(function(target) {
        return b.run(target).flatMap(function(c) {
            return a.run(c.get()).map(function(d) {
                return Store(
                    compose(c.set, d.set),
                    d.get
                );
            });
        });
    });
};

//
//  ## isLens(a)
//
//  Returns `true` if `a` is `Lens`.
//
var isLens = isInstanceOf(Lens);

//
//  ## isPartialLens(a)
//
//  Returns `true` if `a` is `PartialLens`.
//
var isPartialLens = isInstanceOf(PartialLens);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Lens', Lens)
    .property('isLens', isLens)
    .property('PartialLens', PartialLens)
    .property('isPartialLens', isPartialLens);
