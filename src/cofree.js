var Cofree = tagged('Cofree', ['a', 'h']);

Cofree.fromArray = function(a) {
    var result = Option.None,
        index = a.length;

    while(--index > -1) {
        result = Option.Some(Cofree(a[index], result));
    }

    return result;
};


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
                return squishy.extend(cf, f);
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
            x.f.traverse(go, p)
        );
    }
    return go(this);
};

Cofree.prototype.toArray = function() {
    var env = this;
    return squishy.concat(
        [env.a],
        env.h.match({
            Some: function(z) {
                return z.toArray();
            },
            None: constant([])
        })
    );
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
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Cofree', Cofree)
    .method('map', isCofree, function(a, b) {
        return a.map(b);
    });
