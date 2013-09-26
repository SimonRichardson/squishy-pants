//
//  # Helpers
//
//  The helpers module is a collection of functions used often inside
//  of bilby.js or are generally useful for programs.
//

//
//  ## functionName(f)
//
//  Returns the name of function `f`.
//
function functionName(f) {
    return f._name || f.name;
}

//
//  ## functionLength(f)
//
//  Returns the arity of function `f`.
//
function functionLength(f) {
    return f._length || f.length;
}

//
//  ## create(proto)
//
//  Partial polyfill for Object.create - creates a new instance of the
//  given prototype.
//
function create(proto) {
    function Ctor() {}
    Ctor.prototype = proto;
    return new Ctor();
}

//
//  ## getInstance(self, constructor)
//
//  Always returns an instance of constructor.
//
//  Returns self if it is an instanceof constructor, otherwise
//  constructs an object with the correct prototype.
//
function getInstance(self, constructor) {
    return self instanceof constructor ? self : create(constructor.prototype);
}

//
//  ## singleton(k, v)
//
//  Creates a new single object using `k` as the key and `v` as the
//  value. Useful for creating arbitrary keyed objects without
//  mutation:
//
//       squishy.singleton(['Hello', 'world'].join(' '), 42) == {'Hello world': 42}
//
function singleton(k, v) {
    var o = {};
    o[k] = v;
    return o;
}

//
//  ## extend(a, b)
//
//  Right-biased key-value concat of objects `a` and `b`:
//
//       squishy.extend({a: 1, b: 2}, {b: true, c: false}) == {a: 1, b: true, c: false}
//
function extend(a, b) {
    var rec = function(a, b) {
        var i;
        for(i in b) {
            a[i] = b[i];
        }
        return a;
    };
    return rec(rec({}, a), b);
}

//
//  ## bind(f)(o)
//
//  Makes `this` inside of `f` equal to `o`:
//
//       squishy.bind(function() { return this; })(a)() == a
//
//  Also partially applies arguments:
//
//       squishy.bind(squishy.add)(null, 10)(32) == 42
//
function bind(f) {
    function curriedBind(o) {
        /* If native bind doesn't exist, use a polyfill. */
        var args = [].slice.call(arguments, 1),
            g;

        if(f.bind) g = f.bind.apply(f, [o].concat(args));
        else {
            g = function() {
                return f.apply(o, args.concat(rest(arguments)));
            };
        }

        /*
           Let's try and associate all curried functions with the same name as the originator.
           Can't override length but can set _length for currying
        */
        g._name = functionName(f);
        g._length = Math.max(functionLength(f) - args.length, 0);

        return g;
    }

    /* Manual currying since `curry` relies in bind. */
    if(arguments.length > 1) return curriedBind.apply(this, [].slice.call(arguments, 1));
    else return curriedBind;
}

//
//  ## curry(f)
//
//  Takes a normal function `f` and allows partial application of its
//  named arguments:
//
//       var add = bilby.curry(function(a, b) {
//              return a + b;
//          }),
//          add15 = add(15);
//
//       add15(27) == 42;
//
//  Retains ability of complete application by calling the function
//  when enough arguments are filled:
//
//       add(15, 27) == 42;
//
function curry(f) {
    var a = function() {
        var g = bind(f).apply(f, [this].concat(rest(arguments)));

        if(!functionLength(g)) return g();
        else return curry(g);
    };

    /*
       Let's try and associate all curried functions with the same name as the originator.
       Can't override length but can set _length for currying
    */
    a._name = functionName(f);
    a._length = functionLength(f);

    return a;
}

//
//  ## compose(f, g)
//
//  Creates a new function that applies `f` to the result of `g` of the
//  input argument:
//
//       forall f g x. compose(f, g)(x) == f(g(x))
//
function compose(f, g) {
    return function() {
        return f(g.apply(this, rest(arguments)));
    };
}

//
//  ## identity(o)
//
//  Identity function. Returns `o`:
//
//       forall a. identity(a) == a
//
function identity(o) {
    return o;
}

//
//  ## constant(c)
//
//  Constant function. Creates a function that always returns `c`, no
//  matter the argument:
//
//      forall a b. constant(a)(b) == a
//
function constant(c) {
    return function() {
        return c;
    };
}

//
//  ## access(p)(o)
//
//  Access a object property in a lazy fashion.
//
//      access('prop')(object) == object['prop']
//
var access = curry(function(p, o) {
    return o[p];
});

//
//  ## andThen(g)(f)
//
//  Lazy composition using currying.
//  See: compose(f, g)
//
var andThen = curry(function(g, f) {
    return compose(f, g);
});

//
//  ## sequence(a)(b)
//
//  Lazy chaining of structures / containers together.
//
var sequence = curry(function(a, b) {
    return squishy.chain(a, function() {
        return b;
    });
});

//
//  ## minus(a)(b)
//
//  Lazy concatenation of structures / containers together with negate.
//
var minus = curry(function(a, b) {
    return squishy.concat(a, squishy.negate(b));
});

//
//  ## flatten(a, [b])
//
//  Flatten arguments passed via flatten into the function
//
//      flatten(f, [1, 2]) == f.apply(null, [1, 2])
//
var flatten = curry(function(f, b) {
    return f.apply(null, b);
});

//
//  ## liftA2(f, a, b)
//
//  Lifts a curried, binary function `f` into the applicative passes
//  `a` and `b` as parameters.
//
function liftA2(f, a, b) {
    return this.ap(this.map(a, f), b);
}

//
//  ## arrayOf(type)
//
//  Sentinel value for when an array of a particular type is needed:
//
//       arrayOf(Number)
//
function arrayOf(type) {
    var self = getInstance(this, arrayOf);
    self.type = type;
    return self;
}

//
//  ## objectLike(props)
//
//  Sentinel value for when an object with specified properties is
//  needed:
//
//       objectLike({
//           age: Number,
//           name: String
//       })
//
function objectLike(props) {
    var self = getInstance(this, objectLike);
    self.props = props;
    return self;
}

//
//  ## or(a)(b)
//
//  Curried function for `||`.
//
var or = curry(function(a, b) {
    return a || b;
});

//
//  ## and(a)(b)
//
//  Curried function for `&&`.
//
var and = curry(function(a, b) {
    /* Make sure we coerce the value to true. */
    return !!(a && b);
});

//
//  ## add(a)(b)
//
//  Curried function for `+`.
//
var add = curry(function(a, b) {
    return a + b;
});

//
//  ## times(a)(b)
//
//  Curried function for `+`.
//
var times = curry(function(a, b) {
    return a * b;
});

//
//  ## strictEquals(a)(b)
//
//  Curried function for `===`.
//
var strictEquals = curry(function(a, b) {
    return a === b;
});

//
//  ## has(a)(b)
//
//  Has a object got a property
//
//        squishy.has(o, 'p');
//
var has = curry(function(a, b) {
    return b in a;
});

//
//  ## not(a)
//
//  Returns `true` if `a` is not a valid value.
//
function not(a) {
    return !a;
}

//
//  ## error(s)
//
//  Turns the `throw new Error(s)` statement into an expression.
//
function error(s) {
    return function() {
        throw new Error(s);
    };
}

//
//  ## oneOf
//
//  Selects one of the values at random.
//
function oneOf(a) {
    return a[Math.floor(this.randomRange(0, a.length))];
}

//
//  ## fill(s)(t)
//
//  Curried function for filling array.
//
var fill = curry(function(s, t) {
    return this.map(range(0, s), t);
});

//
//  ## range(a, b)
//
//  Create an array with a given range (length).
//
function range(a, b) {
    var total = b - a;
    var rec = function(x, y) {
        if (y - a >= total) return x;

        x[y] = y++;
        return rec(x, y);
    };
    return rec([], a);
}

//
//  ## randomRange(a, b)
//
//  Returns a random number between the range.
//
function randomRange(a, b) {
    return Math.random() * (b - a) + a;
}

//
//  ## inc(a)
//
//  Increments the number by 1
//
function inc(x) {
    return x + 1;
}

//
//  ## dec(a)
//
//  Decrement the number by 1
//
function dec(x) {
    return x - 1;
}

//
//  ## point(a)
//
function point(a) {
    return a.of || a.constructor.of;
}

//
//  ## zero(a)
//
function zero(a) {
    return a.empty || a.constructor.empty;
}

//
//  ## rest(...)
//
//  Convert the rest of the arguments to an array
//
function rest(args) {
    return [].slice.call(args);
}

//
//  ## flip(a)
//
//  Flip the first two arguments of a functions arguments.
//
function flip(f) {
    return curry(function(a, b) {
        var args = rest(arguments).slice(2);

        return f.apply(null, [b, a].concat(args));
    });
}

//
//  ## optional
//
//  Optionally calls the function passed if it's not null. This is glue
//  for calling methods that might not be set yet. If you're looking at this
//  you should seriously consider using Option, which is a lot better at handling
//  these sorts of issues.
//
/* Internal use only - not exposed */
function optional(f) {
    return function() {
        return f ? f.apply(null, rest(arguments)) : null;
    };
}

//
//  ## nothing
//
//  Empty function that can be called with no side affects and does nothing.
//
/* Internal use only - not exposed */
function nothing() {}

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('functionName', functionName)
    .property('functionLength', functionLength)
    .property('create', create)
    .property('getInstance', getInstance)
    .property('singleton', singleton)
    .property('extend', extend)
    .property('bind', bind)
    .property('curry', curry)
    .property('compose', compose)
    .property('identity', identity)
    .property('constant', constant)
    .property('access', access)
    .property('andThen', andThen)
    .property('sequence', sequence)
    .property('minus', minus)
    .property('flatten', flatten)
    .property('liftA2', liftA2)
    .property('arrayOf', arrayOf)
    .property('objectLike', objectLike)
    .property('or', or)
    .property('and', and)
    .property('add', add)
    .property('times', times)
    .property('strictEquals', strictEquals)
    .property('has', has)
    .property('not', not)
    .property('error', error)
    .property('oneOf', oneOf)
    .property('fill', fill)
    .property('range', range)
    .property('randomRange', randomRange)
    .property('inc', inc)
    .property('dec', dec)
    .property('point', point)
    .property('zero', zero)
    .property('rest', rest)
    .property('flip', flip);
