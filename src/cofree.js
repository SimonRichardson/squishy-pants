var Cofree = tagged('Cofree', ['a', 'h']);

Cofree.fromList = function(a) {
    var result = Option.None,
        p = a;

    while(p.isNonEmpty) {
        result = Option.Some(Cofree(p.head, result));
        p = p.tail;
    }

    return result;
};

Cofree.prototype.map = function(f) {
    return Cofree(
        f(this.a),
        squishy.map(
            this.h,
            function(cf) {
                return squishy.map(cf, f);
            }
        )
    );
};

Cofree.prototype.extract = function() {
    return this.a;
};

Cofree.prototype.extend = function(f) {
    return Cofree(
        f(this),
        squishy.map(
            this.h,
            function(cf) {
                return cf.extend(f);
            }
        )
    );
};

Cofree.prototype.traverse = function(f, p) {
    function go(x) {
        return squishy.ap(
            squishy.map(
                f(x.a),
                function(y) {
                    return function(z) {
                        return Cofree(y, z);
                    };
                }
            ),
            x.h.traverse(go, p)
        );
    }
    return go(this);
};

Cofree.prototype.toArray = function() {
    var env = this,
        result = [];
    env.map(function(a) {
        result.push(a);
    });
    return result;
};

Cofree.prototype.toList = function() {
    var env = this,
        result = List.Nil;
    env.map(function(a) {
        result = result.prepend(a);
    });
    return result;
};

//
//  ## isCofree(a)
//
//  Returns `true` if `a` is a `Cofree`.
//
var isCofree = isInstanceOf(Cofree);

//
//  ## cofreeOf(type)
//
//  Sentinel value for when an cofree of a particular type is needed:
//
//       cofreeOf(Number)
//
function cofreeOf(type) {
    var self = getInstance(this, cofreeOf);
    self.type = type;
    return self;
}

//
//  ## isListOf(a)
//
//  Returns `true` if `a` is an instance of `cofreeOf`.
//
var isCofreeOf = isInstanceOf(cofreeOf);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Cofree', Cofree)
    .property('isCofree', isCofree)
    .property('cofreeOf', cofreeOf)
    .property('isCofreeOf', isCofreeOf)
    .method('arb', isCofreeOf, function(a, b) {
        var result = Option.None,
            index = Math.max(1, b - 1);

        while(--index > -1) {
            result = Option.Some(Cofree(this.arb(a.type, b - 1), result));
        }

        return result.get();
    })
    .method('map', isCofree, function(a, b) {
        return a.map(b);
    })
    .method('shrink', isCofree, function() {
        return [];
    });
