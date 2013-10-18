//
//  ## Lens
//
//
//  * `identityLens()` - Identity lens that returns the original target.
//  * `objectLens()` - Lens access for a object at a given property.
//  * `arrayLens()` - Lens access for an array at a given index.
//  * `parse(s)` - Parse a string to for a chain of lenses
//  * `andThen(b)` - Helper method to enable chaining of lens objects.
//  * `compose(b)` - Enabling of composing lenses together.
//
var Lens = tagged('Lens', ['run']),
    PartialLens = tagged('PartialLens', ['run']);

//
//  ### identityLens
//
//  Identity lens that returns the original target.
//
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

//
//  ### objectLens
//
//  Lens access for a object at a given property.
//
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

//
//  ### arrayLens
//
//  Lens access for an array at a given index.
//
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

//
//  ### parse(s)
//
//  Parse a formatted string of accessors to create a series of
//  lenses that can access a object
//
//  The following example will return a the value of `e`.
//
//          Lens.parse('c.z.i[0].e').run(a).get();
//
//  The following example will return a new object with the
//  updated value of `e`.
//
//          Lens.parse('c.z.i[0].e').run(a).set(b);
//
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

//
//  ### andThen
//
//  Helper method to enable chaining of lens objects.
//
Lens.prototype.andThen = function(b) {
    return b.compose(this);
};

//
//  ### compose
//
//  Enabling of composing lenses together.
//
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
//  ### toPartial()
//
//  Return an partial lens from a lens.
//
Lens.prototype.toPartial = function() {
    var self = this;
    return PartialLens(function(target) {
        return Option.Some(self.run(target));
    });
};

//
//  ## PartialLens
//
//  * `identityLens()` - Identity lens that returns the original target.
//  * `objectLens()` - Lens access for a object at a given property.
//  * `arrayLens()` - Lens access for an array at a given index.
//  * `parse(s)` - Parse a string to for a chain of lenses
//  * `andThen(b)` - Helper method to enable chaining of lens objects.
//  * `compose(b)` - Enabling of composing lenses together.
//


//
//  ### identityLens()
//
//  Identity partial lens that returns the original target.
//
PartialLens.identityLens = function() {
    return PartialLens(function(target) {
        return Option.Some(Lens.identityLens().run(target));
    });
};

//
//  ### objectLens(property)
//
//  PartialLens access for a object at a given property if the property
//  exists otherwise returns none.
//
PartialLens.objectLens = function(property) {
    var lens = Lens.objectLens(property);
    return PartialLens(function(target) {
        return property in target ?
                  Option.Some(lens.run(target)) :
                  Option.None;
    });
};

//
//  ### arrayLens(index)
//
//  PartialLens access for an array at a given index if the index exists
//  otherwise returns none.
//
PartialLens.arrayLens = function(index) {
    var lens = Lens.arrayLens(index);
    return PartialLens(function(target) {
        return index >= 0 && index < target.length ?
                  Option.Some(lens.run(target)) :
                  Option.None;
    });
};

//
//  ### andThen(b)
//
//  Helper method to enable chaining of lens objects.
//
PartialLens.prototype.andThen = function(b) {
    return b.compose(this);
};

//
//  ### compose(b)
//
//  Enabling of composing lenses together.
//
PartialLens.prototype.compose = function(b) {
    var a = this;
    return PartialLens(function(target) {
        return b.run(target).chain(function(c) {
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
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Lens.prototype);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Lens', Lens)
    .property('isLens', isLens)
    .property('PartialLens', PartialLens)
    .property('isPartialLens', isPartialLens);
