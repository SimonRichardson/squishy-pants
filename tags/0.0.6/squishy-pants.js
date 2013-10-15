/* Compiled : 2013-10-15 15:31 */
(function(global) {

    'use strict';

    //
    //   ### Description
    //
    //   squishy-pants.js is a semi-serious functional programming library.
    //
    //   ### Usage
    //
    //   node.js:
    //
    //       var squishy = require('squishy-pants');
    //
    //   Browser:
    //
    //       <script src="squishy-pants.min.js"></script>
    //
    //   ### Development
    //
    //   Download the code with git:
    //
    //       git clone https://github.com/SimonRichardson/squishy-pants.git
    //
    //   Install the development dependencies with npm:
    //
    //       npm install
    //
    //   Run the tests with grunt:
    //
    //       npm test
    //

    /* squishy pant's environment means `this` is special */
    /*jshint validthis: true*/

    /* squishy pants uses the !(this instanceof c) trick to remove `new` */
    /*jshint newcap: false*/

    var squishy;

    //   # Environment
    //
    //   Environments are very important in squishy-pants. The library itself is
    //   implemented as a single environment.
    //
    //   An environment holds methods and properties.
    //
    //   Methods are implemented as multi-methods, which allow a form of
    //   *ad-hoc polymorphism*. Duck typing is another example of ad-hoc
    //   polymorphism, but only allows a single implementation at a time, via
    //   prototype mutation.
    //
    //   A method instance is a product of a name, a predicate and an
    //   implementation:
    //
    //       var env = squishy.environment()
    //           .method(
    //               // Name
    //               'negate',
    //               // Predicate
    //               function(n) {
    //                   return typeof n == 'number';
    //               },
    //               // Implementation
    //               function(n) {
    //                   return -n;
    //               }
    //           );
    //
    //       env.negate(100) == -100;
    //
    //   We can now override the environment with Some more implementations:
    //
    //       var env2 = env
    //           .method(
    //               'negate',
    //               function(b) {
    //                   return typeof b == 'boolean';
    //               },
    //               function(b) {
    //                   return !b;
    //               }
    //           );
    //
    //       env2.negate(100) == -100;
    //       env2.negate(true) == false;
    //
    //   Environments are immutable; references to `env` won't see an
    //   implementation for boolean. The `env2` environment could have
    //   overwritten the implementation for number and code relying on `env`
    //   would still work.
    //
    //   Properties can be accessed without dispatching on arguments. They
    //   can almost be thought of as methods with predicates that always
    //   return true:
    //
    //       var env = squishy.environment()
    //           .property('name', 'Squishy');
    //
    //       env.name === 'Squishy';
    //
    function findRegistered(name, registrations, args) {
        var i,
            total;
    
        for(i = 0, total = registrations.length; i < total; i++) {
            if(registrations[i].predicate.apply(this, args))
                return registrations[i].f;
        }
    
        throw new Error('Method `' + name + '` not implemented for this input');
    }
    
    function makeMethod(name, registrations) {
        return function() {
            var args = rest(arguments);
            return findRegistered(name, registrations, args).apply(this, args);
        };
    }
    
    //
    //   ## environment(methods, properties)
    //
    //   * `method(name, predicate, f)` - adds an multimethod implementation
    //   * `property(name, value)` - sets a property to value
    //   * `isDefined(name)` - is a multimethod implement defined
    //   * `isDefinedAt(name, ...rest)` - is a multimethod implemented with arguments
    //
    function environment(methods, properties) {
        var self = getInstance(this, environment),
            i;
    
        methods = methods || {};
        properties = properties || {};
    
        self.method = function(name, predicate, f) {
            var newMethods = extend(methods, singleton(name, (methods[name] || []).concat({
                predicate: predicate,
                f: f
            })));
            return environment(newMethods, properties);
        };
    
        self.property = function(name, value) {
            var newProperties = extend(properties, singleton(name, value));
            return environment(methods, newProperties);
        };
    
        self.isDefined = function(name) {
            return self[name] && functionName(self[name]) === name;
        };
    
        self.isDefinedAt = function(name) {
            var result = false,
                args = rest(arguments).slice(1);
    
            try {
                result = !!findRegistered(name, methods[name], args);
            } catch (e) {}
    
            return result;
        };
    
        for(i in methods) {
            if(self[i]) throw new Error("Method `" + i + "` already in environment.");
            else {
                /* Make sure the methods are names */
                var method = makeMethod(i, methods[i]);
                method._name = i;
                self[i] = method;
            }
        }
    
        for(i in properties) {
            if(self[i]) throw new Error("Property `" + i + "` already in environment.");
            else self[i] = properties[i];
        }
    
        return self;
    }

    squishy = environment();
    squishy = squishy.property('environment', environment);

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
    //  ## then(a, [b])
    //
    //  Then flatten arguments passed via then into the function
    //
    //      then(f, [1, 2]) == f.apply(null, [1, 2])
    //
    var then = curry(function(f, b) {
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
    //  ## randomIntRangeWithout(a, b, c)
    //
    //        randomIntRangeWithout(1, 100, [50, 51])
    //
    //  Returns a random integer between the range, but excluding c
    //
    function randomIntRangeWithout(a, b, c) {
        var x = Math.floor(randomRange(a, b));
        return c.indexOf(x) < 0 ? x : randomIntRangeWithout(a, b, c);
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
    //  ## retrieveMethod(a, n)
    //
    //  Has the `a` got a method with the name either on the instance or
    //  the constructor.
    //
    function retrieveMethod(a, n) {
        return a[n] || a.constructor[n] || (a.prototype && a.prototype[n]);
    }
    
    //
    //  ## point(a)
    //
    function point(a) {
        return retrieveMethod(a, 'of') || retrieveMethod(a.constructor, 'of');
    }
    
    //
    //  ## zero(a)
    //
    function zero(a) {
        return retrieveMethod(a, 'empty') || retrieveMethod(a.constructor, 'empty');
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
    //  ## select(a, b)
    //
    //  Select all the fields from an object with the associative field names
    //
    //      select({a: 1}, ['a']);
    //
    function select(o, fields) {
        return squishy.map(fields, function(v) {
            return o[v];
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
        .property('then', then)
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
        .property('randomIntRangeWithout', randomIntRangeWithout)
        .property('inc', inc)
        .property('dec', dec)
        .property('point', point)
        .property('zero', zero)
        .property('rest', rest)
        .property('flip', flip)
        .property('select', select);

    //
    //  ## isTypeOf(a)(b)
    //
    //  Returns `true` if `b` has `typeof a`.
    //
    var isTypeOf = curry(function(a, b) {
        return typeof b === a;
    });
    
    //
    //  ## isBoolean(a)
    //
    //  Returns `true` if `a` is a `Boolean`.
    //
    var isBoolean = isTypeOf('boolean');
    
    //
    //  ## isFunction(a)
    //
    //  Returns `true` if `a` is a `Function`.
    //
    var isFunction = isTypeOf('function');
    
    //
    //  ## isNumber(a)
    //
    //  Returns `true` if `a` is a `Number`.
    //
    var isNumber = isTypeOf('number');
    
    //
    //  ## isObject(a)
    //
    //  Returns `true` if `a` is a `Object`.
    //
    var isObject = isTypeOf('object');
    
    //
    //  ## isString(a)
    //
    //  Returns `true` if `a` is a `String`.
    //
    var isString = isTypeOf('string');
    
    //
    //  ## isArray(a)
    //
    //  Returns `true` if `a` is an `Array`.
    //
    function isArray(a) {
        if(Array.isArray) return Array.isArray(a);
        else return Object.prototype.toString.call(a) === "[object Array]";
    }
    
    //
    //  ## isSameType
    //
    //  Returns `true` if `a` is the same type of as `b`
    //
    var isSameTypeOf = curry(function(a, b) {
        if (isArray(a) && isArray(b)) {
            return true;
        }
        return isTypeOf(a) === isTypeOf(b);
    });
    
    //
    //  ## isNull(a)
    //
    //  Returns `true` if `a` is `null`.
    //
    function isNull(a) {
        return a === null;
    }
    
    //
    //  ## isUndefined(a)
    //
    //  Returns `true` if `a` is `null`.
    //
    function isUndefined(a) {
        return a === void(0);
    }
    
    //
    //  ## isNaN(a)
    //
    //  Returns `true` if `a` is a not a number including `NaN` and `Infinity`.
    //
    function isNaN(a) {
        return typeof a === 'number' ? (a * 0) !== 0 : true;
    }
    
    //
    //  ## isNotNaN(a)
    //
    //  Returns `true` if `a` is not a `NaN`.
    //
    function isNotNaN(a) {
        return !isNaN(a);
    }
    
    
    //
    //  ## isEven(a)
    //
    //  Returns `true` if `a` is even.
    //
    function isEven(a) {
        return (a & 1) === 0;
    }
    
    //
    //  ## isOdd(a)
    //
    //  Returns `true` if `a` is odd.
    //
    function isOdd(a) {
        return !isEven(a);
    }
    
    //
    //  ## isPalindrome(a)
    //
    //  Returns `true` if `a` is a valid palindrome.
    //
    function isPalindrome(s) {
        var total = s.length;
        if(total < 2) return true;
        if(s.charAt(0) !== s.charAt(total - 1)) return false;
    
        return isPalindrome(s.substr(1, total - 2));
    }
    
    //
    //  ## isInstanceOf(a)(b)
    //
    //  Returns `true` if `a` is an instance of `b`.
    //
    var isInstanceOf = curry(function(a, b) {
        return b instanceof a;
    });
    
    //
    //  ## isArrayOf(a)
    //
    //  Returns `true` if `a` is an instance of `arrayOf`.
    //
    var isArrayOf = isInstanceOf(arrayOf);
    
    //
    //  ## isObjectLike(a)
    //
    //  Returns `true` if `a` is an instance of `objectLike`.
    //
    var isObjectLike = isInstanceOf(objectLike);
    
    //
    //  ## isAnyOf(a)(b)
    //
    //  Returns `true` if `b` is any `strictEquals [a]`.
    //
    var isAnyOf = curry(function(a, b) {
        var i;
    
        for(i = 0; i < a.length; i++) {
            if(strictEquals(a[i])(b)) {
                return true;
            }
        }
    
        return false;
    });
    
    //
    //  ## isAnyTypeOf(a)(b)
    //
    //  Returns `true` if `b` is any `typeof [a]`.
    //
    var isAnyTypeOf = curry(function(a, b) {
        var i;
    
        for(i = 0; i < a.length; i++) {
            if(isTypeOf(a[i])(b)) {
                return true;
            }
        }
    
        return false;
    });
    
    //
    //  ## isAnyInstanceOf(a)(b)
    //
    //  Returns `true` if `b` is any `instanceof [a]`.
    //
    var isAnyInstanceOf = curry(function(a, b) {
        var i;
    
        for(i = 0; i < a.length; i++) {
            if(isInstanceOf(a[i])(b)) {
                return true;
            }
        }
    
        return false;
    });
    
    //
    //  ## isEnvironment(a)
    //
    //  Returns `true` if `a` is an instance of `environment`.
    //
    var isEnvironment = function(a) {
        return isInstanceOf(environment, a);
    };
    
    //
    //  ## isComparable(a)
    //
    //  Returns `true` if `a` has a method called `equal`
    //
    var isComparable = flip(has)('equal');
    
    //
    //  ## isPlainObject(a)
    //
    //  Returns `true` if `a` is a plain object
    //
    /* We need a secure stateless object to test against */
    var own = {};
    
    function isPlainObject(a) {
        if(!isObject(a)) {
            return false;
        }
    
        /* Trap any errors that we can receive from testing host objects */
        try {
            if (a.constructor && !own.hasOwnProperty.call(a.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
    
        return true;
    }
    
    //
    //  ### isEmpty(a)
    //
    //  Checks to see if a value is empty or not.
    //
    //       console.log(squishy.isEmpty([])); // Outputs `true`
    //
    squishy = squishy
        .method('isEmpty', isBoolean, not)
        .method('isEmpty', isFunction, not)
        .method('isEmpty', isNumber, function(a) {
            return isNaN(a) || a < 1;
        })
        .method('isEmpty', isString, function(a) {
            return !/\S/.test(a);
        })
        .method('isEmpty', isArray, function(a) {
            return a.length < 1;
        })
        .method('isEmpty', isObject, function(a) {
            var i,
                index;
    
            for(i in o) {
                index++;
            }
            return index < 1;
        })
        .method('isEmpty', strictEquals(null), constant(false))
        .method('isEmpty', strictEquals(undefined), constant(false));
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('isTypeOf', isTypeOf)
        .property('isBoolean', isBoolean)
        .property('isFunction', isFunction)
        .property('isNumber', isNumber)
        .property('isObject', isObject)
        .property('isString', isString)
        .property('isArray', isArray)
        .property('isSameTypeOf', isSameTypeOf)
        .property('isNaN', isNaN)
        .property('isNotNaN', isNotNaN)
        .property('isEven', isEven)
        .property('isOdd', isOdd)
        .property('isPalindrome', isPalindrome)
        .property('isInstanceOf', isInstanceOf)
        .property('isArrayOf', isArrayOf)
        .property('isObjectLike', isObjectLike)
        .property('isAnyOf', isAnyOf)
        .property('isAnyTypeOf', isAnyTypeOf)
        .property('isAnyInstanceOf', isAnyInstanceOf)
        .property('isEnvironment', isEnvironment)
        .property('isComparable', isComparable)
        .property('isPlainObject', isPlainObject);

    //
    //  # QuickCheck
    //
    //  QuickCheck is a form of *automated specification testing*. Instead
    //  of manually writing tests cases like so:
    //
    //       assert(0 + 1 == 1);
    //       assert(1 + 1 == 2);
    //       assert(3 + 3 == 6);
    //
    //  We can just write the assertion algebraicly and tell QuickCheck to
    //  automaticaly generate lots of inputs:
    //
    //       squishy.forAll(
    //           function(n) {
    //               return n + n == 2 * n;
    //           },
    //           [Number]
    //       ).fold(
    //           function(fail) {
    //               return "Failed after " + fail.tries + " tries: " + fail.inputs.toString();
    //           },
    //           "All tests passed!",
    //       )
    //
    function generateInputs(env, args, size) {
        return env.map(args, function(arg) {
            return env.arb(arg, size);
        });
    }
    
    function findSmallest(env, property, inputs) {
        var shrunken = env.map(inputs, env.shrink),
            smallest = [].concat(inputs),
            args,
            i,
            j;
    
        for(i = 0; i < shrunken.length; i++) {
            args = [].concat(smallest);
            for(j = 0; j < shrunken[i].length; j++) {
                args[i] = shrunken[i][j];
                if(property.apply(this, args))
                    break;
                smallest[i] = shrunken[i][j];
            }
        }
    
        return smallest;
    }
    
    //
    //  ### failureReporter
    //
    //  * inputs - the arguments to the property that failed
    //  * tries - number of times inputs were tested before Failure
    //
    function failureReporter(inputs, tries) {
        var self = getInstance(this, failureReporter);
        self.inputs = inputs;
        self.tries = tries;
        return self;
    }
    
    //
    //  ## forAll(property, args)
    //
    //  Generates values for each type in `args` using `squishy.arb` and
    //  then passes them to `property`, a function returning a
    //  `Boolean`. Tries `goal` number of times or until Failure.
    //
    //  Returns an `Option` of a `failureReporter`:
    //
    //       var reporter = squishy.forAll(
    //           function(s) {
    //               return isPalindrome(s + s.split('').reverse().join(''));
    //           },
    //           [String]
    //       );
    //
    function forAll(property, args) {
        var inputs,
            i;
    
        for(i = 0; i < this.goal; i++) {
            inputs = generateInputs(this, args, i);
            if(!property.apply(this, inputs)) {
                return Option.Some(failureReporter(
                    findSmallest(this, property, inputs),
                    i + 1
                ));
            }
        }
    
        return Option.None;
    }
    
    //
    //  ## goal
    //
    //  The number of Successful inputs necessary to declare the whole
    //  property a Success:
    //
    //       var _ = squishy.property('goal', 1000);
    //
    //  Default is `100`.
    //
    var goal = 30;//00;
    
    //
    //  ## AnyVal
    //
    //  Sentinel value for when any type of primitive value is needed.
    //
    var AnyVal = {};
    
    //
    //  ## OptionalVal
    //
    //  Sentinel value for when any type of primitive value that is optionally needed.
    //
    var OptionalVal = {};
    
    //
    //  ## Char
    //
    //  Sentinel value for when a single character string is needed.
    //
    var Char = {};
    
    //
    //  ## Integer
    //
    //  Sentinel value for when a integer is needed.
    //
    var Integer = {};
    
    //
    //  # Random
    //
    //  Sentinel value for when a random value is needed.
    //
    var Rand = {};
    
    squishy = squishy
        .property('generateInputs', generateInputs)
        .property('failureReporter', failureReporter)
        .property('forAll', forAll)
        .property('goal', goal)
        .property('AnyVal', AnyVal)
        .property('OptionalVal', OptionalVal)
        .property('Char', Char)
        .property('Integer', Integer)
        .property('Rand', Rand);
    
    //
    //  ### arbitrary values
    //
    //  Creates an arbitrary value depending on the type.
    //
    //       console.log(squishy.arb(Number)); // Outputs a random number
    //
    squishy = squishy
        .method('arb', strictEquals(AnyVal), function(a, s) {
            var types = [Boolean, Number, String];
            return this.arb(this.oneOf(types), s - 1);
        })
        .method('arb', strictEquals(Array), function(a, s) {
            return this.arb(arrayOf(AnyVal), s - 1);
        })
        .method('arb', strictEquals(Boolean), function(a, s) {
            return Math.random() < 0.5;
        })
        .method('arb', strictEquals(Char), function(a, s) {
            /* Should consider 127 (DEL) to be quite dangerous? */
            return String.fromCharCode(Math.floor(this.randomRange(32, 255)));
        })
        .method('arb', strictEquals(Integer), function(a, s) {
            var variance = Math.pow(2, 32) - 1;
            return Math.floor(this.randomRange(-variance, variance));
        })
        .method('arb', strictEquals(Rand), function(a, s) {
            return Math.random() * s - 1;
        })
        .method('arb', strictEquals(Function), function(a, s) {
            return nothing;
        })
        .method('arb', isArrayOf, function(a, s) {
            var accum = [],
                length = this.randomRange(0, s),
                i;
    
            for(i = 0; i < length; i++) {
                accum.push(this.arb(a.type, s - 1));
            }
    
            return accum;
        })
        .method('arb', isObjectLike, function(a, s) {
            var isOptionalVal = strictEquals(OptionalVal),
                o = {},
                i;
    
            for(i in a.props) {
                var opt = isOptionalVal(a.props[i]);
                if (!opt || opt && this.randomRange(0, 1) <= 0.5) {
                    o[i] = this.arb(opt ? AnyVal : a.props[i], s);
                }
            }
    
            return o;
        })
        .method('arb', strictEquals(Number), function(a, s) {
            /*
              Divide the Number.MAX_VALUE by the goal, so we don't get
              a Number overflow (worst case Infinity), meaning we can
              add multiple arb(Number) together without issues.
            */
            var variance = Math.pow(2, 53) / this.goal;
            return this.randomRange(-variance, variance);
        })
        .method('arb', strictEquals(Object), function(a, s) {
            var o = {},
                length = this.randomRange(0, s),
                i;
    
            for(i = 0; i < length; i++) {
                o[this.arb(String, s - 1)] = this.arb(AnyVal, s - 1);
            }
    
            return o;
        })
        .method('arb', strictEquals(String), function(a, s) {
            return this.arb(arrayOf(Char), s - 1).join('');
        });
    
    //
    //  ### shrink values
    //
    //  Shrinks values for utilizing against checking values.
    //
    //       console.log(squishy.shrink([1, 2, 3, 4])); // [[1, 2, 3, 4], [1, 2, 3]]
    //
    squishy = squishy
        .method('shrink', isArray, function(a) {
            var accum = [[]],
                x = a.length;
    
            while(x) {
                x = Math.floor(x / 2);
    
                if (x) accum.push(a.slice(a.length = x));
            }
    
            return accum;
        })
        .method('shrink', isBoolean, function(b) {
            return b ? [false] : [];
        })
        .method('shrink', isNumber, function(n) {
            var accum = [0],
                x = n;
    
            if (n < 0) accum.push(-n);
    
            while(x) {
                x = x / 2;
                x = x < 0 ? Math.ceil(x) : Math.floor(x);
    
                if (x) accum.push(n - x);
            }
    
            return accum;
        })
        .method('shrink', isString, function(s) {
            var accum = [''],
                x = s.length;
    
            while(x) {
                x = Math.floor(x / 2);
    
                if (x) accum.push(s.substring(0, s.length - x));
            }
    
            return accum;
        })
        .method('shrink', isPlainObject, function(s) {
            return [];
        });

    squishy = squishy
        .method('map', isFunction, curry(function(a, b) {
            return compose(b, a);
        }))
        .method('concat', isFunction, curry(function(a, b) {
            return a().concat(b());
        }))
        .method('ap', isFunction, curry(function(a, b) {
            return function(x) {
                return a(x)(b(x));
            };
        }));
    
    squishy = squishy
        .method('dimap', isFunction, function(a, b) {
            var env = this;
            return function(c) {
                return compose(compose(b, c), a);
            };
        })
        .method('kleisli', isFunction, function(a, b) {
            var env = this;
            return function(x) {
                return env.chain(a(x), b);
            };
        });
    
    squishy = squishy
        .method('concat', isBoolean, curry(function(a, b) {
            return a & b;
        }))
        .method('concat', squishy.liftA2(or, isNumber, isString), curry(function(a, b) {
            return a + b;
        }))
        .method('map', isBoolean, curry(function(a, b) {
            return b(a);
        }))
        .method('map', squishy.liftA2(or, isNumber, isString), curry(function(a, b) {
            return b(a);
        }))
        .method('negate', isBoolean, function(a) {
            return !a;
        })
        .method('negate', isNumber, function(a) {
            return -a;
        });
    
    //
    //  ### equal(a, b)
    //
    //  Checks to see if a type equals another type. This is a uses deep equality for
    //  complex structures like `object` and `array`s.
    //
    squishy = squishy
        .method('equal', isNull, strictEquals)
        .method('equal', isBoolean, strictEquals)
        .method('equal', isFunction, strictEquals)
        .method('equal', isNumber, strictEquals)
        .method('equal', isString, strictEquals)
        .method('equal', isArray, function(a, b) {
            var env = this;
            /* We need to be sure that the lengths do actually match here. */
            if (and(a, b) && isArray(b) && strictEquals(a.length, b.length)) {
                return env.fold(env.zip(a, b), true, function(v, t) {
                    return v && env.equal(t._1, t._2);
                });
            }
            return false;
        })
        .method('equal', strictEquals(undefined), strictEquals)
        .method('equal', squishy.liftA2(and, isObject, andThen(isComparable, not)), function(a, b) {
            var i;
            /* We need to be sure that the there is an `a` and a `b` here. */
            if (and(a, b) && isObject(b)) {
                /* This would be better if we turn objects into ordered
                   arrays so we can pass it through equal(a, b) */
                for (i in a) {
                    if (!squishy.equal(a[i], b[i]))
                        return false;
                }
                for (i in b) {
                    if (!squishy.equal(b[i], a[i]))
                        return false;
                }
                return true;
            }
            return false;
        })
        .property('expect', function(a) {
            var env = this;
            return singleton('toBe',
                function (b) {
                    return env.equal(b, a);
                }
            );
        });
    
    //
    //  ### of(a)
    //
    //  Creates a value from the type.
    //
    //  The left identity of `squishy.of(m, a).chain(f)` is equivalent to
    //  `f(squishy.of(m, a))` and then equivalent of `f(a)` without using `squishy.of`.
    //  Similarly the right identity of `squishy.chain(m, m.of)` is equivalent to
    //  `m` or `m.chain(m.of)` without using `squishy.of`.
    //
    //       console.log(squishy.of(Array, [1, 2, 3])); // Outputs `[1, 2, 3]`
    //
    squishy = squishy
        .method('of', strictEquals(AnyVal), function() {
            var types = [Boolean, Number, String];
            return this.of(this.oneOf(types));
        })
        .method('of', strictEquals(Array), identity)
        .method('of', strictEquals(Boolean), identity)
        .method('of', strictEquals(Function), identity)
        .method('of', strictEquals(Number), identity)
        .method('of', strictEquals(Object), identity)
        .method('of', strictEquals(String), identity);
    
    //
    //  ### empty()
    //
    //  Creates an empty value depending on the type. Each resulting value
    //  will be classified as falsy for the type. Boolean will be
    //  `false` and Array will be an empty `[]` for example.
    //
    //       console.log(squishy.empty(Array)); // Outputs `[]`
    //
    squishy = squishy
        .method('empty', strictEquals(AnyVal), function() {
            var types = [Boolean, Number, String];
            return this.empty(this.oneOf(types));
        })
        .method('empty', strictEquals(Array), function() {
            return [];
        })
        .method('empty', strictEquals(Boolean), function() {
            return false;
        })
        .method('empty', strictEquals(Function), function() {
            return function() {};
        })
        .method('empty', strictEquals(Number), function() {
            return 0;
        })
        .method('empty', strictEquals(Object), function() {
            return {};
        })
        .method('empty', strictEquals(String), function() {
            return '';
        });

    //
    //  ## tagged(name, fields)
    //
    //  Creates a simple constructor for a tagged object.
    //
    //       var Tuple = tagged('Tuple', ['a', 'b']);
    //       var x = Tuple(1, 2);
    //       var y = new Tuple(3, 4);
    //       x instanceof Tuple && y instanceof Tuple;
    //
    function tagged(name, fields) {
        function wrapped() {
            var self = getInstance(this, wrapped),
                total = fields.length,
                values = [].slice.call(arguments),
                i;
    
            if (values.length != total) {
                throw new TypeError("Expected " + fields.length + " arguments, got " + values.length + " for " + name);
            }
    
            for (i = 0; i < total; i++) {
                self[fields[i]] = values[i];
            }
    
            self.toString = makeToString(values);
    
            /* Make sure we don't overwrite already existing implementations */
            if (!self.toArray) {
                self.toArray = makeToArray(values);
            }
    
            return self;
        }
    
        function makeToString(a) {
            return function() {
                var values = squishy.map(a, function(x) {
                        return x.toString ? x.toString() : '' + x;
                    }),
                    flattened = squishy.reduce(values, function(x, y) {
                        return x + ', ' + y;
                    });
                return name + (values.length > 0 ? '(' + flattened + ')' : '');
            };
        }
    
        function makeToArray(a) {
            return function() {
                var values = squishy.map(a, function(x) {
                        return x.toArray ? x.toArray() : x;
                    }),
                    flattened = squishy.fold(values, [], function(x, y) {
                        return squishy.concat(x, y);
                    });
                return flattened;
            };
        }
    
        /* Make sure the fields is an array */
        if (!isArray(fields)) {
            throw new TypeError("Expected Array but got `" + (typeof fields) + "`");
        }
    
        /* Make sure the tagged are named */
        wrapped._name = name;
        wrapped._length = fields.length;
    
        return wrapped;
    }
    
    //
    //  ## taggedSum(constructors)
    //
    //  Creates a disjoint union of constructors, with a catamorphism.
    //
    //        var List = taggedSum({
    //            Cons: ['car', 'cdr'],
    //            Nil: []
    //        });
    //        function listLength(l) {
    //            return l.match({
    //                Cons: function(car, cdr) {
    //                    return 1 + listLength(cdr);
    //                },
    //                Nil: function() {
    //                    return 0;
    //                }
    //            });
    //        }
    //        listLength(List.Cons(1, new List.Cons(2, List.Nil()))) == 2;
    //
    function taggedSum(name, constructors) {
        var key,
            proto;
    
        function definitions() {
            throw new TypeError('Tagged sum was called instead of one of its properties.');
        }
    
        function constructMatch(key) {
            return function(dispatches) {
                var fields = constructors[key],
                    accessor = dispatches[key],
                    args = squishy.select(this, fields);
    
                if(!accessor) {
                    throw new TypeError("Constructors given to match didn't include: " + key);
                }
    
                return accessor.apply(this, args);
            };
        }
    
        function makeProto(key, constructors) {
            var proto = create(definitions.prototype);
            proto.match = constructMatch(key);
    
            /*
                - Make sure the taggedSum are named
                - Pass the constructors around so we can then do recursive matching.
                - Make sure that taggedSum items have a toString
            */
            proto._name = key;
            proto._tagged = definitions;
            proto._constructors = constructors;
    
            proto.toString = constant(key);
    
            return proto;
        }
    
        for (key in constructors) {
            if (!constructors[key].length) {
                definitions[key] = makeProto(key, definitions);
                definitions[key].toArray = constant([]);
                continue;
            }
    
            definitions[key] = tagged(key, constructors[key]);
            definitions[key].prototype = makeProto(key, constructors);
        }
    
        definitions._name = name;
    
        return definitions;
    }
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('tagged', tagged)
        .property('taggedSum', taggedSum);

    //
    //   # Array
    //
    //        Array a
    //
    //   Represents a sequence of values that are indexed by integers.
    //
    //   * `ap(a, b)` - Applicative ap(ply)
    //   * `chain(a, f)` - Applies the given function f to each element of this array, then concatenates the results.
    //   * `concat(a, b)` - Appends two array objects.
    //   * `count(a, f)` - Count the number of elements in the array which satisfy a predicate.
    //   * `drop(a, n)` - Returns the array without its n first elements. If this array has less than n elements, the empty array is returned.
    //   * `dropRight(a, n)` - Returns the array without its rightmost `n` elements.
    //   * `dropWhile(a, f)` - Returns the longest suffix of this array whose first element does not satisfy the predicate.
    //   * `exists(a, f)` - Tests the existence in this array of an element that satisfies the predicate.
    //   * `filter(a, f)` - Returns all the elements of this array that satisfy the predicate p.
    //   * `find(a)` - Returns the element in this array of an element that satisfies the predicate.
    //   * `first(a)` - Retrieve the first value.
    //   * `flatten(a)` - Concatenate nested elements of this array.
    //   * `fold(a, v, f)` - Combines the elements of this array together using the binary function f, from Left to Right, and starting with the value v.
    //   * `foldRight(a, v, f)` - Combines the elements of this array together using the binary function f, from Right to Left, and starting with the value v.
    //   * `last(a)` - Retrieve the last value.
    //   * `map(a, f)` - Returns the array resulting from applying the given function f to each element of this array.
    //   * `partition(a, f)` - Partition the array in two sub-arrays according to a predicate.
    //   * `reduce(a, f)` - Combines the elements of this array together using the binary operator op, from Left to Right
    //   * `reduceRight(a, f)` - Combines the elements of this array together using the binary operator op, from Right to Left
    //   * `tail(n)` - Returns the tail elements of this array.
    //   * `take(n)` - Returns the n first elements of this array.
    //   * `takeRight(n)` - Returns the rightmost n elements from this array.
    //   * `takeWhile(f)` - Returns the longest prefix of this array whose elements satisfy the predicate.
    //   * `zip(a, b)` - Returns a array formed from this array and the specified array that by associating each element of the former with the element at the same position in the latter.
    //   * `zipWithIndex(a)` -  Returns a array form from this array and a index of the value that is associated with each element index position.
    //
    
    //
    //  ### ap(b, [concat])
    //
    //  Apply a function in the applicative of each function
    //  Applicative ap(ply)
    //
    var ap = curry(function(a, b) {
        var accum = [],
            x = a.length,
            y = b.length,
            i,
            j;
    
        for(i = 0; i < x; i++) {
            for(j = 0; j < y; j++) {
                accum.push(a[i](b[j]));
            }
        }
    
        return accum;
    });
    
    //
    //  ### chain(f)
    //
    //  Applies the given function f to each element of this array, then
    //  concatenates the results.
    //
    var chain = curry(function(a, f) {
        var accum = [],
            total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            accum = accum.concat(f(a[i]));
        }
    
        return accum;
    });
    
    //
    //  ### concat(b)
    //
    //  Appends two array objects.
    //  semigroup concat
    //
    var concat = curry(function(a, b) {
        return a.concat(b);
    });
    
    //
    //  ### count(f)
    //
    //  Count the number of elements in the array which satisfy a predicate.
    //
    var count = curry(function(a, f) {
        var accum = 0,
            total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            if(f(a[i])) {
                accum = inc(accum);
            }
        }
    
        return accum;
    });
    
    //
    //  ### drop(f)
    //
    //  Returns the array without its n first elements. If this array has
    //  less than n elements, the empty array is returned.
    //
    var drop = curry(function(a, n) {
        return a.slice(n);
    });
    
    //
    //  ### dropRight(n)
    //
    //  Returns the array without its rightmost `n` elements.
    //
    var dropRight = curry(function(a, n) {
        return a.slice(0, -n);
    });
    
    //
    //  ### dropWhile(f)
    //
    //  Returns the longest suffix of this array whose first element
    //  does not satisfy the predicate.
    //
    var dropWhile = curry(function(a, f) {
        var total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            if(!f(a[i])) {
                return a.slice(i);
            }
        }
    
        return a.slice();
    });
    
    //
    //  ### exists(f)
    //
    //  Tests the existence in this array of an element that satisfies
    //  the predicate.
    //
    var exists = curry(function(a, f) {
        var total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            if(f(a[i])) {
                return true;
            }
        }
    
        return false;
    });
    
    //
    //  ### flatten(a)
    //
    //  Concatenate nested elements of this array.
    //
    var flatten = curry(function(a) {
        return chain(a, function(b) {
            return isArray(b) ? b : [b];
        });
    });
    
    //
    //  ### filter(f)
    //
    //  Returns all the elements of this array that satisfy the predicate p.
    //
    var filter = curry(function(a, f) {
        var accum = [],
            total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            if (f(a[i])) {
                accum.push(a[i]);
            }
        }
    
        return accum;
    });
    
    //
    //  ### find(f)
    //
    //  Returns the element in this array of an element that satisfies
    //  the predicate.
    //
    var find = curry(function(a, f) {
        var total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            if(f(a[i])) {
                return a[i];
            }
        }
    
        return null;
    });
    
    //
    //  ### first(a)
    //
    //  Retrieve the first value.
    //
    var first = function(a) {
        return a[0];
    };
    
    //
    //  ### fold(v, f)
    //
    //  Combines the elements of this array together using the binary function f,
    //  from Left to Right, and starting with the value v.
    //
    var fold = curry(function(a, v, f) {
        var total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            v = f(v, a[i]);
        }
    
        return v;
    });
    
    //
    //  ### foldRight(v, f)
    //
    //  Combines the elements of this array together using the binary function f,
    //  from Right to Left, and starting with the value v.
    //
    var foldRight = curry(function(a, v, f) {
        var i;
    
        for (i = a.length - 1; i >= 0; --i) {
            v = f(v, a[i]);
        }
    
        return v;
    });
    
    //
    //  ### last(f)
    //
    //  Retrieve the last value
    //
    var last = function(a) {
        return a[a.length - 1];
    };
    
    //
    //  ### map(f)
    //
    //  Returns the array resulting from applying the given function f to each
    //  element of this array.
    //
    var map = curry(function(a, f) {
        var accum = [],
            total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            accum[i] = f(a[i]);
        }
    
        return accum;
    });
    
    //
    //  ### partition(f)
    //
    //  Partition the array in two sub-arrays according to a predicate.
    //
    var partition = curry(function(a, f) {
        var left = [],
            right = [],
            total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            if(f(a[i])) left.push(a[i]);
            else right.push(a[i]);
        }
    
        return Tuple2(left, right);
    });
    
    //
    //  ### reduce(f)
    //
    //  Combines the elements of this array together using the binary operator
    //  op, from Left to Right
    //
    var reduce = curry(function(a, f) {
        var v = a[0] || null,
            total,
            i;
    
        for (i = 1, total = a.length; i < total; i++) {
            v = f(v, a[i]);
        }
    
        return v;
    });
    
    //
    //  ### reduceRight(f)
    //
    //  Combines the elements of this array together using the binary operator
    //  op, from Right to Left
    //
    var reduceRight = curry(function(a, f) {
        var total = a.length,
            v = a[total - 1] || null,
            i;
    
        for (i = total - 2; i >= 0; --i) {
            v = f(v, a[i]);
        }
    
        return v;
    });
    
    //
    //  ### tail(a)
    //
    //  Returns the tail elements of this array.
    //
    var tail = function(a) {
        return a.slice(1);
    };
    
    //
    //  ### take(v, f)
    //
    //  Returns the n first elements of this array.
    //
    var take = curry(function(a, m) {
        return a.slice(0, m);
    });
    
    //
    //  ### takeRight(n)
    //
    //  Returns the rightmost n elements from this array.
    //
    var takeRight = curry(function(a, n) {
        return a.slice(-n);
    });
    
    //
    //  ### takeWhile(v, f)
    //
    //  Returns the longest prefix of this array whose elements satisfy
    //  the predicate.
    //
    var takeWhile = curry(function(a, f) {
        var total,
            i;
    
        for (i = 0, total = a.length; i < total; i++) {
            if(!f(a[i])) {
                return a.slice(0, i);
            }
        }
    
        return [];
    });
    
    //
    //  ### zip(b)
    //
    //  Returns a array formed from this array and the specified array that
    //  by associating each element of the former with the element at the same
    //  position in the latter.
    //
    var zip = curry(function(a, b) {
        var accum = [],
            total = Math.min(a.length, b.length),
            i;
    
        for (i = 0; i < total; i++) {
            accum[i] = Tuple2(a[i], b[i]);
        }
    
        return accum;
    });
    
    //
    //  ### zipWithIndex()
    //
    //  Returns a array form from this array and a index of the value that
    //  is associated with each element index position.
    //
    var zipWithIndex = curry(function(a) {
        var accum = [],
            total = a.length,
            i;
    
        for (i = 0; i < total; i++) {
            accum[i] = Tuple2(a[i], i);
        }
    
        return accum;
    });
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .method('ap', isArray, ap)
        .method('chain', isArray, chain)
        .method('concat', isArray, concat)
        .method('count', isArray, count)
        .method('drop', isArray, drop)
        .method('dropRight', isArray, dropRight)
        .method('dropWhile', isArray, dropWhile)
        .method('exists', isArray, exists)
        .method('flatten', isArray, flatten)
        .method('filter', isArray, filter)
        .method('find', isArray, find)
        .method('first', isArray, first)
        .method('fold', isArray, fold)
        .method('foldRight', isArray, foldRight)
        .method('last', isArray, last)
        .method('map', isArray, map)
        .method('partition', isArray, partition)
        .method('reduce', isArray, reduce)
        .method('reduceRight', isArray, reduceRight)
        .method('tail', isArray, tail)
        .method('take', isArray, take)
        .method('takeRight', isArray, takeRight)
        .method('takeWhile', isArray, takeWhile)
        .method('zip', isArray, zip)
        .method('zipWithIndex', isArray, zipWithIndex);

    //
    //  # Fo (Fantasy Overloading)
    //
    //  Overloaded operators for compatible JavaScript:
    //
    //  * `>=` Monad chain:
    //
    //        fo()(
    //            Option.Some(1) >= function(x) {
    //                return x < 0 ? Option.None : Option.Some(x + 2);
    //            }
    //        ).getOrElse(0) == 3;
    //
    //  * `<` Monad sequence:
    //
    //        fo()(
    //            Option.Some(1) < Option.Some(2)
    //        ).getOrElse(0) == 2;
    //
    //  * `%` Functor map:
    //
    //        fo()(
    //            Option.Some(1) % add(2)
    //        ).getOrElse(0) == 3;
    //
    //  * `*` Applicative ap(ply):
    //
    //        fo()(
    //            Option.Some(add) * Option.Some(1) * Option.Some(2)
    //        ).getOrElse(0) == 3;
    //
    //  * `<<` Compose:
    //
    //        fo()(
    //            add(1) << times(2)
    //        )(3) == 7;
    //
    //  * `>>` Compose reverse:
    //
    //        fo()(
    //            add(1) >> times(2)
    //        )(3) == 8;
    //
    //  * `+` Semigroup concat:
    //
    //        fo()(
    //            Option.Some([1, 2]) + Option.Some([3, 4])
    //        ).getOrElse([]) == [1, 2, 3, 4];
    //
    //  * `-` Group minus:
    //
    //        fo()(
    //            Option.Some(1) - Option.Some(2)
    //        ).getOrElse(0) == -1;
    //
    
    /* Gross mutable global */
    var foQueue;
    
    //
    //    ## fo()(a)
    //
    //    Creates a new syntax scope. The `a` expression is allowed multiple
    //    usages of a single operator per `fo` call.
    //
    //    For most operations, the associated name will be called on the
    //    operands. for example:
    //
    //        fo()(Option.Some([1, 2]) + Option.Some([3, 4]))
    //
    //    De-sugars into:
    //
    //        Option.Some([1, 2]).concat(Option.Some([3, 4]))
    //
    //    The exceptions are `andThen`, `sequence` and `minus`. They are
    //    derived from Compose, Monad and Group, respectively.
    //
    function fo() {
        var env = squishy,
            prevFoQueue = foQueue;
    
        if(arguments.length) {
            env.error('Expecting no arguments given to fo. Use fo()(arguments)')();
        }
    
        foQueue = [];
    
        //
        //  ## proxy(prop)(a)(b)
        //
        //  Lazy dynamic composing of structures / containers together via a property.
        //
        var proxy = curry(function(prop, a, b) {
            return env[prop](a, b);
        });
    
        return function(n) {
            var op,
                x;
    
            if(!foQueue.length) {
                foQueue = prevFoQueue;
                return n;
            }
    
            // Possible syntax for `chain`
            // `>= > === ==`
            if(n === false) {
                op = proxy('chain');
    
            // Possible syntax for `andThen` (inverted `compose`)
            // `>> >>> &`
            } else if(n === 0) {
                op = andThen;
    
            // Possible syntax for `compose`
            // `<<`
            } else if(n === Math.pow(2, (2 << foQueue.length) - 3)) {
                op = proxy('compose');
    
            // Possible syntax for `ap`
            // `*`
            } else if(n === Math.pow(2, foQueue.length * (foQueue.length + 1) / 2)) {
                op = proxy('ap');
    
            // Possible syntax for `concat`
            // `+ | ^`
            } else if(n === (2 << foQueue.length) - 2) {
                op = proxy('concat');
    
            // Possible syntax for `map`
            // `%`
            } else if(n === 2) {
                op = proxy('map');
    
            // Possible syntax for `minus`
            // `-`
            } else if(n < 0) {
                op = minus;
    
            // Possible syntax for `sequence`
            // `< <= !== !=`
            } else if(n === true) {
                op = sequence;
    
            } else {
                foQueue = prevFoQueue;
                env.error("Couldn't determine operation. Has fo.unsafeSetValueOf been called for all operands?")();
            }
    
            x = env.reduce(foQueue, function(a, b) {
                /* Unbox a overload if it is wrapped in */
                var left = isBox(a) ? a.extract() : a,
                    right = isBox(b) ? b.extract() : b;
    
                return op(left).call(left, right);
            });
    
            foQueue = prevFoQueue;
    
            return x;
        };
    }
    
    //
    //   ## fo.unsafeSetValueOf(proto)
    //
    //   Used to mutate the `valueOf` property on `proto`. Necessary to fo
    //   the `fo` block's operator overloading. Uses the object's existing
    //   `valueOf` if not in a `fo` block.
    //
    //   *Warning:* this mutates `proto`. May not be safe, even though it
    //   tries to default back to the normal behaviour when not in a `fo`
    //   block.
    //
    fo.unsafeSetValueOf = function(proto) {
        var prev = proto.valueOf;
        proto.valueOf = function() {
    
            if(foQueue === void(0)) {
                return prev.call(this);
            }
    
            foQueue.push(this);
    
            return 1 << foQueue.length;
        };
    };
    
    //
    //  ## Function wrapper
    //
    //  This wraps a function so we can extract it later, ideal for for
    //  chaining functions (see fo.chain).
    //
    /*
        This is an alternative for overriding `fo.unsafeSetValueOf(Function.prototype)`,
        which obviously is not what we want to do if the library is interfacing with
        other external sources. So we Box the function so we can later test against it.
    */
    var Box = tagged('Box', ['value']);
    
    Box.prototype.extract = function() {
        return this.value;
    };
    
    //
    //  ## isBox(a)
    //
    //  Returns `true` if `a` is an instance of `Box`.
    //
    var isBox = isInstanceOf(Box);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Box.prototype);
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('fo', fo)
        .property('Box', Box);

    //
    //  ## Generic Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //  * `equal(a)` - `true` if `a` is equal to `this`
    //
    
    var transformer = function(ctor) {
    
        return function(M) {
    
            //
            //  ## of(x)
            //
            //  Constructor `of` Monad creating `ctor` for the value of `x`.
            //
            ctor.of = function(a) {
                return ctor(point(M)(a));
            };
    
            //
            //  ## empty()
            //
            //  Constructor `empty` Monad creating `ctor` for the
            //  value of `M.empty()`.
            //
            ctor.empty = function() {
                return ctor(empty(M)());
            };
    
            //
            //  ### lift(b)
            //
            //  Lift the `ctor` to a new `ctor`
            //
            ctor.lift = ctor;
    
            //
            //  ### ap(b)
            //
            //  Apply a function in the environment of the value of the identity
            //  transformer
            //  Applicative ap(ply)
            //
            if (isFunction(retrieveMethod(M, 'ap'))) {
                ctor.prototype.ap = function(a) {
                    return this.chain(function(f) {
                        return squishy.map(a, f);
                    });
                };
            }
    
            //
            //  ### chain(f)
            //
            //  Bind through the value of the identity transformer
            //  Monadic flatMap/bind
            //
            if (isFunction(retrieveMethod(M, 'chain'))) {
                ctor.prototype.chain = function(f) {
                    return ctor(this.run.chain(function(x) {
                        return f(x).run;
                    }));
                };
            }
    
            //
            //  ### equal(b)
            //
            //  Compare two option values for equality
            //
            if (isFunction(retrieveMethod(M, 'equal'))) {
                ctor.prototype.equal = function(b) {
                    return squishy.equal(this.run, b.run);
                };
            }
    
            //
            //  ### map(f)
            //
            //  Map on the value of this identity.
            //  Functor map
            //
            if (isFunction(retrieveMethod(M, 'map'))) {
                ctor.prototype.map = function(f) {
                    return this.chain(function(a) {
                        return ctor.of(f(a));
                    });
                };
            }
    
            return ctor;
        };
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('transformer', transformer);

    //
    //   # Attempt
    //
    //        Attempt e v = Failure e + Success v
    //
    //   The Attempt data type represents a "Success" value or a
    //   semigroup of "Failure" values. Attempt has an applicative
    //   functor which collects Failures' errors or creates a new Success
    //   value.
    //
    //   Here's an example function which validates a String:
    //
    //        function nonEmpty(field, string) {
    //            return string
    //                ? squishy.Success(string)
    //                : squishy.Failure([field + " must be non-empty"]);
    //        }
    //
    //   ## Success(value)
    //
    //   Represents a Successful `value`.
    //
    //   ## Failure(errors)
    //
    //   Represents a Failure.
    //
    //   * `ap(b)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `equal(a)` - `true` if `a` is equal to `this`
    //   * `extract()` - extract the value from attempt
    //   * `fold(a, b)` - `a` applied to value if `Left(x)`, `b` if `Right(x)`
    //   * `map(f)` - Functor map
    //   * `swap()` - Swap values
    //   * `isSuccess` - `true` if `this` is `Success(x)`
    //   * `isFailure` - `true` if `this` is `Failure(x)`
    //   * `toArray()` - `[x]` if `Success(x)`, `[]` if `Failure(x)`
    //   * `toOption()` - `Some(x)` if `Success(x)`, `None` if `Failure(x)`
    //   * `toStream()` - `Stream.of(x)` if `Success(x)`, `Stream.empty()` if `Failure(x)`
    //   * `toLeft(r)` - `Left(x)` if `Success(x)`, `Right(r)` if `Failure(x)`
    //   * `toRight(l)` - `Right(x)` if `Success(x)`, `Left(l)` if `Failure(x)`
    //
    var Attempt = taggedSum('Attempt', {
        Success: ['value'],
        Failure: ['errors']
    });
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the success of this attempt,
    //  accumulating errors
    //  Applicative ap(ply)
    //
    Attempt.prototype.ap = function(b) {
        var env = this;
        return env.match({
            Success: function(value) {
                return squishy.map(b, value);
            },
            Failure: function(e) {
                return b.match({
                    Success: constant(env),
                    Failure: function(errors) {
                        return Attempt.Failure(squishy.concat(e, errors));
                    }
                });
            }
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the success of the attempt
    //  Monadic flatMap/bind
    //
    Attempt.prototype.chain = function(f) {
        var env = this;
        return env.match({
            Success: f,
            Failure: constant(env)
        });
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two attempt values for equality
    //
    Attempt.prototype.equal = function(a) {
        return this.match({
            Success: function(x) {
                return a.match({
                    Success: function(y) {
                        return squishy.equal(x, y);
                    },
                    Failure: constant(false)
                });
            },
            Failure: function(x) {
                return a.match({
                    Success: constant(false),
                    Failure: function(y) {
                        return squishy.equal(x, y);
                    }
                });
            }
        });
    };
    
    //
    //  ### extract()
    //
    //  Extract the value from the attempt.
    //
    Attempt.prototype.extract = function() {
        return this.match({
            Success: identity,
            Failure: identity
        });
    };
    
    //
    //  ### fold(a, b)
    //
    //  Catamorphism. Run the first given function if failure, otherwise,
    //  the second given function.
    //   `a` applied to value if `Success`, `b` if `Failure`
    //
    Attempt.prototype.fold = function(a, b) {
        return this.match({
            Success: a,
            Failure: b
        });
    };
    
    //
    //  ### map(f)
    //
    //  Map on the success of this attempt.
    //  Functor map
    //
    Attempt.prototype.map = function(f) {
        return this.match({
            Success: function(a) {
                return Attempt.Success(f(a));
            },
            Failure: function(e) {
                return Attempt.Failure(e);
            }
        });
    };
    
    //
    //  ### swap()
    //
    //  Flip the failure/success values in this attempt.
    //
    Attempt.prototype.swap = function() {
        return this.match({
            Success: Attempt.Failure,
            Failure: Attempt.Success
        });
    };
    
    //
    //  ### toOption()
    //
    //  Return an empty option or option with one element on the success
    //  of this attempt.
    //  `Some(x)` if `Success(x)`, `None` if `Failure()`
    //
    Attempt.prototype.toOption = function() {
        return this.match({
            Success: Option.Some,
            Failure: function() {
                return Option.None;
            }
        });
    };
    
    //
    //  ### toLeft()
    //
    //  Return an left either bias if attempt is a success.
    //  `Left(x)` if `Success(x)`, `Right(x)` if `Failure(x)`
    //
    Attempt.prototype.toLeft = function() {
        return this.match({
            Success: Either.Left,
            Failure: Either.Right
        });
    };
    
    //
    //  ### toRight()
    //
    //  Return an right either bias if attempt is a success.
    //  `Right(x)` if `Success(x)`, `Left(x)` if `Failure(x)`
    //
    Attempt.prototype.toRight = function() {
        return this.match({
            Success: Either.Left,
            Failure: Either.Right
        });
    };
    
    //
    //  ### toArray()
    //
    //  Return an empty array for a `Failure` `Attempt`.
    //
    Attempt.Failure.prototype.toArray = function() {
        return [];
    };
    
    //
    //  ### toStream()
    //
    //  Return an empty stream or stream with one element on the success
    //  of this attempt.
    //
    Attempt.prototype.toStream = function() {
        return this.match({
            Success: Stream.of,
            Failure: Stream.empty
        });
    };
    
    //
    //  ## Success(x)
    //
    //  Constructor to represent the existance of a value, `x`.
    //
    Attempt.Success.prototype.isSuccess = true;
    Attempt.Success.prototype.isFailure = false;
    
    //
    //  ## Failure(x)
    //
    //  Constructor to represent the existance of a value, `x`.
    //
    Attempt.Failure.prototype.isSuccess = false;
    Attempt.Failure.prototype.isFailure = true;
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Attempt.Success` with value of `x`.
    //
    Attempt.of = function(x) {
        return Attempt.Success(x);
    };
    
    //
    //  ## empty()
    //
    //  Constructor `empty` Monad creating `Attempt.Failure`.
    //
    Attempt.empty = function() {
        return Attempt.Failure();
    };
    
    //
    //  ## isAttempt(a)
    //
    //  Returns `true` if `a` is a `Success` or a `Failure`.
    //
    var isAttempt = isInstanceOf(Attempt);
    
    //
    //  ## Attempt Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //  * `equal(a)` - `true` if `a` is equal to `this`
    //
    var AttemptT = tagged('AttemptT', ['run']);
    
    Attempt.AttemptT = transformer(AttemptT);
    
    //
    //  ## isAttemptT(a)
    //
    //  Returns `true` if `a` is `AttemptT`.
    //
    var isAttemptT = isInstanceOf(AttemptT);
    
    //
    //  ## successOf(type)
    //
    //  Sentinel value for when an success of a particular type is needed:
    //
    //       successOf(Number)
    //
    function successOf(type) {
        var self = getInstance(this, successOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isSuccessOf(a)
    //
    //  Returns `true` if `a` is an instance of `successOf`.
    //
    var isSuccessOf = isInstanceOf(successOf);
    
    //
    //  ## failureOf(type)
    //
    //  Sentinel value for when an failure of a particular type is needed:
    //
    //       failureOf(Number)
    //
    function failureOf(type) {
        var self = getInstance(this, failureOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isFailureOf(a)
    //
    //  Returns `true` if `a` is an instance of `failureOf`.
    //
    var isFailureOf = isInstanceOf(failureOf);
    
    //
    //  ## attemptTOf(type)
    //
    //  Sentinel value for when an attempt of a particular type is needed:
    //
    //       attemptTOf(Number)
    //
    function attemptTOf(type) {
        var self = getInstance(this, attemptTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isAttemptTOf(a)
    //
    //  Returns `true` if `a` is an instance of `attemptTOf`.
    //
    var isAttemptTOf = isInstanceOf(attemptTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Attempt.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an attempt structure.
    //
    Attempt.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return a.match({
                        Success: function() {
                            return Attempt.of(s);
                        },
                        Failure: function() {
                            return Attempt.Failure(s);
                        }
                    });
                },
                function() {
                    return a.match({
                        Success: identity,
                        Failure: identity
                    });
                }
            );
        });
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Attempt', Attempt)
        .property('AttemptT', Attempt.AttemptT)
        .property('Success', Attempt.Success)
        .property('Failure', Attempt.Failure)
        .property('successOf', successOf)
        .property('failureOf', failureOf)
        .property('attemptTOf', attemptTOf)
        .property('isAttempt', isAttempt)
        .property('isSuccessOf', isSuccessOf)
        .property('isFailureOf', isFailureOf)
        .property('isAttemptT', isAttemptT)
        .property('isAttemptTOf', isAttemptTOf)
        .method('of', strictEquals(Attempt), function(x) {
            return Attempt.of(x);
        })
        .method('empty', strictEquals(Attempt), function() {
            return Attempt.empty();
        })
    
        .method('arb', isSuccessOf, function(a, b) {
            return Attempt.Success(this.arb(a.type, b - 1));
        })
        .method('arb', isFailureOf, function(a, b) {
            return Attempt.Failure(this.arb(a.type, b - 1));
        })
        .method('arb', isAttemptTOf, function(a, b) {
            return Attempt.AttemptT(this.arb(successOf(a.type), b - 1));
        })
    
        .method('extract', isAttempt, function(a) {
            return a.extract();
        })
        .method('fold', isAttempt, function(a, b, c) {
            return a.fold(b, c);
        })
        .method('toArray', isAttempt, function(a) {
            return a.toArray();
        })
        .method('toStream', isAttempt, function(a) {
            return a.toStream();
        })
    
        .method('ap', squishy.liftA2(or, isAttempt, isAttemptT), function(a, b) {
            return a.ap(b);
        })
        .method('chain', squishy.liftA2(or, isAttempt, isAttemptT), function(a, b) {
            return a.chain(b);
        })
        .method('equal', squishy.liftA2(or, isAttempt, isAttemptT), function(a, b) {
            return a.equal(b);
        })
        .method('map', squishy.liftA2(or, isAttempt, isAttemptT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isAttempt, isAttemptT), function(a) {
            return [];
        });

    //
    //   # Either
    //
    //        Either a b = Left a + Right b
    //
    //   Represents a tagged disjunction between two sets of values; `a` or
    //   `b`. Methods are Right-biased.
    //
    //   * `ap(e)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `concat(s, f)` - Semigroup concat
    //   * `fold(a, b)` - `a` applied to value if `Left(x)`, `b` if `Right(x)`
    //   * `map(f)` - Functor map
    //   * `swap()` - If this is a Left, then return the Left value in Right or vice versa.
    //   * `isLeft` - `true` iff `this` is `Left(x)`
    //   * `isRight` - `true` iff `this` is `Right(x)`
    //   * `toOption()` - `None` if `Left(x)`, `Some(x)` value of `Right(x)`
    //   * `toArray()` - `[]` if `Left(x)`, `[x]` value if `Right(x)`
    //   * `toAttempt()` - `Failure(x)` if `Left(x)`, `Success(x)` value if `Right(x)`
    //   * `toStream()` - `Stream.empty()` if `Left(x)`, `Stream.of(x)` value if `Right(x)`
    //
    var Either = taggedSum('Either', {
        Left: ['value'],
        Right: ['value']
    });
    
    //
    //  ### ap(b, concat)
    //
    //  Apply a function in the environment of the right of this either,
    //  accumulating errors
    //  Applicative ap(ply)
    //
    Either.prototype.ap = function(e) {
        var env = this;
        return env.match({
            Left: constant(env),
            Right: function(x) {
                return squishy.map(e, x);
            }
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the success of the either
    //  Monadic flatMap/bind
    //
    Either.prototype.chain = function(f) {
        var env = this;
        return env.match({
            Left: constant(env),
            Right: f
        });
    };
    
    //
    //  ### concat(s, f)
    //
    //  Concatenate two eithers associatively together.
    //  Semigroup concat
    //
    Either.prototype.concat = function(s, f) {
        var env = this;
        return env.match({
            Left: function() {
                return squishy.fold(
                    s,
                    constant(env),
                    constant(s)
                );
            },
            Right: function(y) {
                return squishy.map(s, function(x) {
                    return f(x, y);
                });
            }
        });
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two attempt values for equality
    //
    Either.prototype.equal = function(a) {
        return this.match({
            Left: function(x) {
                return a.match({
                    Left: function(y) {
                        return squishy.equal(x, y);
                    },
                    Right: constant(false)
                });
            },
            Right: function(x) {
                return a.match({
                    Left: constant(false),
                    Right: function(y) {
                        return squishy.equal(x, y);
                    }
                });
            }
        });
    };
    
    //
    //  ### extract(a)
    //
    //  Extract the value from the either.
    //
    Either.prototype.extract = function() {
        return this.match({
            Left: identity,
            Right: identity
        });
    };
    
    //
    //  ### fold(a, b)
    //
    //  Catamorphism. Run the first given function if failure, otherwise,
    //  the second given function.
    //   `a` applied to value if `Left`, `b` if `Right`
    //
    Either.prototype.fold = function(a, b) {
        return this.match({
            Left: a,
            Right: b
        });
    };
    
    //
    //  ### map(f)
    //
    //  Map on the right of this either.
    //  Functor map
    //
    Either.prototype.map = function(f) {
        var env = this;
        return env.match({
            Left: constant(env),
            Right: function(x) {
                return Either.Right(f(x));
            }
        });
    };
    
    //
    //  ### swap()
    //
    //  Flip the left/right values in this either.
    //
    Either.prototype.swap = function() {
        return this.match({
            Left: function(x) {
                return Either.Right(x);
            },
            Right: function(x) {
                return Either.Left(x);
            }
        });
    };
    
    //
    //  ### toOption()
    //
    //  Return an empty option or option with one element on the right
    //  of this either.
    //  `Some(x)` if `Success(x)`, `None` if `Failure()`
    //
    Either.prototype.toOption = function() {
        return this.match({
            Left: function() {
                return Option.None;
            },
            Right: Option.Some
        });
    };
    
    //
    //  ### toAttempt()
    //
    //  Return failure if either is a left and success if either is right.
    //  `Left(x)` if `Failure(x)`, `Right(x)` if `Success(x)`
    //
    Either.prototype.toAttempt = function() {
        return this.match({
            Left: Attempt.Failure,
            Right: Attempt.Success
        });
    };
    
    //
    //  ### toArray()
    //
    //  Return an empty array for a `Left` `Either`.
    //
    Either.Left.prototype.toArray = function() {
        return [];
    };
    
    //
    //  ### toStream()
    //
    //  Return an empty stream or stream with one element on the right
    //  of this either.
    //
    Attempt.prototype.toStream = function() {
        return this.match({
            Left: Stream.empty,
            Right: Stream.of
        });
    };
    
    //
    //  ## Left(x)
    //
    //  Constructor to represent the Left case.
    //
    Either.Left.prototype.isLeft = true;
    Either.Left.prototype.isRight = false;
    
    //
    //  ## Right(x)
    //
    //  Constructor to represent the (biased) Right case.
    //
    Either.Right.prototype.isLeft = false;
    Either.Right.prototype.isRight = true;
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Either.Right` with value of `x`.
    //
    Either.of = function(x) {
        return Either.Right(x);
    };
    
    //
    //  ## empty()
    //
    //  Constructor `empty` Monad creating `Either.Left`.
    //
    Either.Right.empty = function() {
        return Either.Left();
    };
    
    
    //
    //  ## isEither(a)
    //
    //  Returns `true` if `a` is a `Left` or a `Right`.
    //
    var isEither = isInstanceOf(Either);
    
    //
    //  ## Either Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //  * `equal(a)` - `true` if `a` is equal to `this`
    //
    var EitherT = tagged('EitherT', ['run']);
    
    Either.EitherT = transformer(EitherT);
    
    //
    //  ## isEitherT(a)
    //
    //  Returns `true` if `a` is `EitherT`.
    //
    var isEitherT = isInstanceOf(EitherT);
    
    //
    //  ## leftOf(type)
    //
    //  Sentinel value for when an left of a particular type is needed:
    //
    //       leftOf(Number)
    //
    function leftOf(type) {
        var self = getInstance(this, leftOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isLeftOf(a)
    //
    //  Returns `true` if `a` is an instance of `leftOf`.
    //
    var isLeftOf = isInstanceOf(leftOf);
    
    //
    //  ## rightOf(type)
    //
    //  Sentinel value for when an right of a particular type is needed:
    //
    //       rightOf(Number)
    //
    function rightOf(type) {
        var self = getInstance(this, rightOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isRightOf(a)
    //
    //  Returns `true` if `a` is an instance of `rightOf`.
    //
    var isRightOf = isInstanceOf(rightOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Either.prototype);
    
    //
    //  ## eitherTOf(type)
    //
    //  Sentinel value for when an either of a particular type is needed:
    //
    //       eitherTOf(Number)
    //
    function eitherTOf(type) {
        var self = getInstance(this, eitherTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isEitherTOf(a)
    //
    //  Returns `true` if `a` is an instance of `eitherTOf`.
    //
    var isEitherTOf = isInstanceOf(eitherTOf);
    
    //
    //  ### lens
    //
    //  Lens access for an attempt structure.
    //
    Either.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return a.match({
                        Left: function() {
                            return Either.Left(s);
                        },
                        Right: function() {
                            return Either.Right(s);
                        }
                    });
                },
                function() {
                    return a.match({
                        Left: identity,
                        Right: identity
                    });
                }
            );
        });
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Either', Either)
        .property('EitherT', EitherT)
        .property('Left', Either.Left)
        .property('Right', Either.Right)
        .property('leftOf', leftOf)
        .property('rightOf', rightOf)
        .property('eitherTOf', eitherTOf)
        .property('isEither', isEither)
        .property('isEitherT', isEitherT)
        .property('isLeftOf', isLeftOf)
        .property('isRightOf', isRightOf)
        .property('isEitherTOf', isEitherTOf)
        .method('of', strictEquals(Either), function(x) {
            return Either.of(x);
        })
        .method('empty', strictEquals(Either), function(x) {
            return Either.Left.empty();
        })
    
        .method('arb', isLeftOf, function(a, b) {
            return Either.Left(this.arb(a.type, b - 1));
        })
        .method('arb', isRightOf, function(a, b) {
            return Either.Right(this.arb(a.type, b - 1));
        })
        .method('arb', isEitherTOf, function(a, b) {
            return Either.EitherT(Either.of(this.arb(a.type, b - 1)));
        })
    
        .method('concat', isEither, function(a, b) {
            return a.concat(b, this.concat);
        })
        .method('extract', isEither, function(a) {
            return a.extract();
        })
        .method('fold', isEither, function(a, b, c) {
            return a.fold(b, c);
        })
        .method('toArray', isEither, function(a) {
            return a.toArray();
        })
        .method('toStream', isAttempt, function(a) {
            return a.toStream();
        })
    
        .method('ap', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
            return a.ap(b);
        })
        .method('chain', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
            return a.chain(b);
        })
        .method('equal', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
            return a.equal(b);
        })
        .method('map', squishy.liftA2(or, isEither, isEitherT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isEither, isEitherT), function(a) {
            return [];
        });

    //
    //   # Option
    //
    //       Option a = Some a + None
    //
    //   The option type encodes the presence and absence of a value. The
    //   `Some` constructor represents a value and `None` represents the
    //   absence.
    //
    //   * `ap(s)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `concat(s, plus)` - Semigroup concat
    //   * `equal(a)` -  `true` if `a` is equal to `this`
    //   * `extract()` -  extract the value from option
    //   * `fold(a, b)` - Applies `a` to value if `Some` or defaults to `b`
    //   * `get()` - get the value from option
    //   * `getOrElse(a)` - Default value for `None`
    //   * `map(f)` - Functor map
    //   * `isSome` - `true` if `this` is `Some`
    //   * `isNone` - `true` if `this` is `None`
    //   * `toAttempt(r)` - `Success(x)` if `Some(x)`, `Failure(r)` if `None`
    //   * `toArray()` - `[x]` if `Some(x)`, `[]` if `None`
    //   * `toStream()` - `Stream.of(x)` if `Some(x)`, `Stream.empty()` if `None`
    //   * `toLeft(r)` - `Left(x)` if `Some(x)`, `Right(r)` if None
    //   * `toRight(l)` - `Right(x)` if `Some(x)`, `Left(l)` if None
    //
    var Option = taggedSum('Option', {
        Some: ['value'],
        None: []
    });
    
    //
    //  ### toOption(a)
    //  @deprecated
    //
    Option.toOption = function(a) {
        return a !== null ? Option.Some(a) : Option.None;
    };
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the some of this option,
    //  accumulating errors
    //  Applicative ap(ply)
    //
    Option.prototype.ap = function(a) {
        return this.chain(
            function(f) {
                return squishy.map(a, f);
            }
        );
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the success of the option
    //  Monadic flatMap/bind
    //
    Option.prototype.chain = function(f) {
        return this.match({
            Some: f,
            None: constant(this)
        });
    };
    
    //
    //  ### concat(s, f)
    //
    //  Concatenate two options associatively together.
    //  Semigroup concat
    //
    Option.prototype.concat = function(s) {
        return this.match({
            Some: function(x) {
                return squishy.map(
                    s,
                    function(y) {
                        return squishy.concat(x, y);
                    }
                );
            },
            None: constant(this)
        });
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two option values for equality
    //
    Option.prototype.equal = function(a) {
        return this.match({
            Some: function(x) {
                return a.match({
                    Some: function(y) {
                        return squishy.equal(x, y);
                    },
                    None: constant(false)
                });
            },
            None: function() {
                return a.match({
                    Some: constant(false),
                    None: constant(true)
                });
            }
        });
    };
    
    //
    //  ### extract()
    //
    //  Extract the value from the option.
    //
    Option.prototype.extract = function() {
        return this.match({
            Some: identity,
            None: constant(null)
        });
    };
    
    //
    //  ### fold(a, b)
    //
    //  Catamorphism. Run the first given function if failure, otherwise,
    //  the second given function.
    //   `a` applied to value if `Some`, `b` if `None`
    //
    Option.prototype.fold = function(f, g) {
        return this.match({
            Some: f,
            None: g
        });
    };
    
    //
    //  ### get()
    //
    //  Get the value from the option.
    //
    Option.prototype.get = function() {
        return this.match({
            Some: identity,
            None: error('Unexpected value')
        });
    };
    
    //
    //  ### get()
    //
    //  Get the value from the option or else
    //
    Option.prototype.getOrElse = function(x) {
        return this.match({
            Some: identity,
            None: constant(x)
        });
    };
    
    //
    //  ### map(f)
    //
    //  Map on the some of this option.
    //  Functor map
    //
    Option.prototype.map = function(f) {
        return this.chain(
            function(a) {
                return Option.of(f(a));
            }
        );
    };
    
    //
    //  ### toAttempt()
    //
    //  Return failure if option is a some and success if option is none.
    //  `None` if `Failure(x)`, `Some(x)` if `Success(e)`
    //
    Option.prototype.toAttempt = function() {
        return this.match({
            Some: Attempt.Success,
            None: function() {
                return Attempt.Failure(squishy.empty(Array));
            }
        });
    };
    
    //
    //  ### toLeft()
    //
    //  Return an left either bias if option is a some.
    //  `Left(x)` if `Some(x)`, `Right(x)` if `None`
    //
    Option.prototype.toLeft = function(o) {
        return this.match({
            Some: Either.Left,
            None: function() {
                return Either.Right(o);
            }
        });
    };
    
    //
    //  ### toRight()
    //
    //  Return an right either bias if option is a some.
    //  `Right(x)` if `Some(x)`, `Left(x)` if `None`
    //
    Option.prototype.toRight = function(o) {
        return this.match({
            Some: Either.Right,
            None: function() {
                return Either.Left(o);
            }
        });
    };
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Option` with value of `x`.
    //
    Option.of = function(x) {
        return Option.Some(x);
    };
    
    //
    //  ## empty()
    //
    //  Constructor `empty` Monad creating `Option` with no value.
    //
    Option.empty = function() {
        return Option.None;
    };
    
    //
    //  ## Some(x)
    //
    //  Constructor to represent the existence of a value, `x`.
    //
    Option.Some.prototype.isSome = true;
    Option.Some.prototype.isNone = false;
    
    //
    //  ## None
    //
    //  Represents the absence of a value.
    //
    Option.None.isSome = false;
    Option.None.isNone = true;
    
    //
    //  ## isOption(a)
    //
    //  Returns `true` if `a` is a `Some` or `None`.
    //
    var isOption = isInstanceOf(Option);
    
    //
    //  ## Option Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //  * `equal(a)` - `true` if `a` is equal to `this`
    //
    
    var OptionT = tagged('OptionT', ['run']);
    
    Option.OptionT = transformer(OptionT);
    
    //
    //  ## isOptionT(a)
    //
    //  Returns `true` if `a` is `OptionT`.
    //
    var isOptionT = isInstanceOf(OptionT);
    
    //
    //  ## someOf(type)
    //
    //  Sentinel value for when an some of a particular type is needed:
    //
    //       someOf(Number)
    //
    function someOf(type) {
        var self = getInstance(this, someOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isSomeOf(a)
    //
    //  Returns `true` if `a` is an instance of `someOf`.
    //
    var isSomeOf = isInstanceOf(someOf);
    
    //
    //  ## noneOf()
    //
    //  Sentinel value for when an none is needed:
    //
    //       noneOf()
    //
    function noneOf() {
        var self = getInstance(this, noneOf);
        return self;
    }
    
    //
    //  ## isNoneOf(a)
    //
    //  Returns `true` if `a` is an instance of `noneOf`.
    //
    var isNoneOf = isInstanceOf(noneOf);
    
    //
    //  ## optionTOf(type)
    //
    //  Sentinel value for when an option of a particular type is needed:
    //
    //       optionTOf(Number)
    //
    function optionTOf(type) {
        var self = getInstance(this, optionTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isOptionTOf(a)
    //
    //  Returns `true` if `a` is an instance of `optionTOf`.
    //
    var isOptionTOf = isInstanceOf(optionTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Option.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an option structure.
    //
    Option.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return a.match({
                        Some: function() {
                            return Option.Some(s);
                        },
                        None: constant(Option.None)
                    });
                },
                function() {
                    return a.match({
                        Some: identity,
                        None: identity
                    });
                }
            );
        });
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Option', Option)
        .property('OptionT', OptionT)
        .property('Some', Option.Some)
        .property('None', Option.None)
        .property('someOf', someOf)
        .property('noneOf', noneOf)
        .property('optionTOf', optionTOf)
        .property('isOption', isOption)
        .property('isOptionT', isOptionT)
        .property('isSomeOf', isSomeOf)
        .property('isNoneOf', isNoneOf)
        .property('isOptionTOf', isOptionTOf)
        .property('toOption', Option.toOption)
        .method('of', strictEquals(Option.Some), function(x) {
            return Option.Some.of(x);
        })
        .method('empty', strictEquals(Option.Some), function(x) {
            return Option.None;
        })
    
        .method('arb', isSomeOf, function(a, b) {
            return Option.Some(this.arb(a.type, b - 1));
        })
        .method('arb', isNoneOf, function(a, b) {
            return Option.None;
        })
        .method('arb', isOptionTOf, function(a, b) {
            return Option.OptionT(this.arb(someOf(a.type), b - 1));
        })
    
        .method('concat', isOption, function(a, b) {
            return a.concat(b);
        })
        .method('extract', isOption, function(a) {
            return a.extract();
        })
        .method('fold', isOption, function(a, b, c) {
            return a.fold(b, c);
        })
        .method('toArray', isOption, function(a) {
            return a.toArray();
        })
    
        .method('ap', squishy.liftA2(or, isOption, isOptionT), function(a, b) {
            return a.ap(b);
        })
        .method('chain', squishy.liftA2(or, isOption, isOptionT), function(a, b) {
            return a.chain(b);
        })
        .method('equal', squishy.liftA2(or, isOption, isOptionT), function(a, b) {
            return a.equal(b);
        })
        .method('map', squishy.liftA2(or, isOption, isOptionT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isOption, isOptionT), function(a) {
            return [];
        });

    //
    //  # Tuples
    //
    //  Tuples are another way of storing multiple values in a single value.
    //  They have a fixed number of elements (immutable), and so you can't
    //  cons to a tuple.
    //  Elements of a tuple do not need to be all of the same type
    //
    //  Example usage:
    //
    //       squishy.Tuple2(1, 2);
    //       squishy.Tuple3(1, 2, 3);
    //       squishy.Tuple4(1, 2, 3, 4);
    //       squishy.Tuple5(1, 2, 3, 4, 5);
    //
    var Tuple2 = tagged('Tuple2', ['_1', '_2']),
        Tuple3 = tagged('Tuple3', ['_1', '_2', '_3']),
        Tuple4 = tagged('Tuple4', ['_1', '_2', '_3', '_4']),
        Tuple5 = tagged('Tuple5', ['_1', '_2', '_3', '_4', '_5']);
    
    //
    //   ## Tuple2
    //
    //   * `flip()` - flip values
    //   * `concat()` - Semigroup (value must also be a Semigroup)
    //   * `equal(a)` -  `true` if `a` is equal to `this`
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `toArray()` - `[_1, _2]` of the tuple
    //
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Tuple2`.
    //
    Tuple2.of = function(a, b) {
        return Tuple2(a, b);
    };
    
    //
    //  ### first(t)
    //
    //  Retrieve the first argument.
    //
    Tuple2.first = function(t) {
        return t._1;
    };
    
    //
    //  ### second(t)
    //
    //  Retrieve the second argument.
    //
    Tuple2.second = function(t) {
        return t._2;
    };
    
    //
    //   ### flip()
    //
    //   Flip the values of the first and second.
    //
    Tuple2.prototype.flip = function() {
        return Tuple2.of(this._2, this._1);
    };
    
    //
    //  ### concat(s, f)
    //
    //  Concatenate two tuples associatively together.
    //  Semigroup concat
    //
    Tuple2.prototype.concat = function(b) {
        return Tuple2.of(
            squishy.concat(this._1, b._1),
            squishy.concat(this._2, b._2)
        );
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two option values for equality
    //
    Tuple2.prototype.equal = function(b) {
        return squishy.equal(this.toArray(), b.toArray());
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the tuple of the tuples
    //  Monadic flatMap/bind
    //
    Tuple2.prototype.chain = function(f) {
        return f(this);
    };
    
    //
    //   ## Tuple3
    //
    //   * `concat()` - Semigroup (value must also be a Semigroup)
    //   * `equal(a)` -  `true` if `a` is equal to `this`
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `toArray()` - `[_1, _2, _3]` of the tuple
    //
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Tuple3`.
    //
    Tuple3.of = function(a, b, c) {
        return Tuple3(a, b, c);
    };
    
    //
    //  ### concat(s, f)
    //
    //  Concatenate two tuples associatively together.
    //  Semigroup concat
    //
    Tuple3.prototype.concat = function(b) {
        return Tuple3.of(
            squishy.concat(this._1, b._1),
            squishy.concat(this._2, b._2),
            squishy.concat(this._3, b._3)
        );
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two option values for equality
    //
    Tuple3.prototype.equal = function(b) {
        return squishy.equal(this.toArray(), b.toArray());
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the tuple of the tuples
    //  Monadic flatMap/bind
    //
    Tuple3.prototype.chain = function(f) {
        return f(this);
    };
    
    //
    //   ## Tuple4
    //
    //   * `concat()` - Semigroup (value must also be a Semigroup)
    //   * `equal(a)` -  `true` if `a` is equal to `this`
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `toArray()` - `[_1, _2, _3, _4]` of the tuple
    //
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Tuple4`.
    //
    Tuple4.of = function(a, b, c, d) {
        return Tuple4(a, b, c, d);
    };
    
    //
    //  ### concat(s, f)
    //
    //  Concatenate two tuples associatively together.
    //  Semigroup concat
    //
    Tuple4.prototype.concat = function(b) {
        return Tuple4.of(
            squishy.concat(this._1, b._1),
            squishy.concat(this._2, b._2),
            squishy.concat(this._3, b._3),
            squishy.concat(this._4, b._4)
        );
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two option values for equality
    //
    Tuple4.prototype.equal = function(b) {
        return squishy.equal(this.toArray(), b.toArray());
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the tuple of the tuples
    //  Monadic flatMap/bind
    //
    Tuple4.prototype.chain = function(f) {
        return f(this);
    };
    
    //
    //   ## Tuple5
    //
    //   * `concat()` - Semigroup (value must also be a Semigroup)
    //   * `equal(a)` -  `true` if `a` is equal to `this`
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `toArray()` - `[_1, _2, _3, _4, _5]` of the tuple
    //
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Tuple5`.
    //
    Tuple5.of = function(a, b, c, d, e) {
        return Tuple5(a, b, c, d, e);
    };
    
    //
    //  ### concat(s, f)
    //
    //  Concatenate two tuples associatively together.
    //  Semigroup concat
    //
    Tuple5.prototype.concat = function(b) {
        return Tuple5.of(
            squishy.concat(this._1, b._1),
            squishy.concat(this._2, b._2),
            squishy.concat(this._3, b._3),
            squishy.concat(this._4, b._4),
            squishy.concat(this._5, b._5)
        );
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two option values for equality
    //
    Tuple5.prototype.equal = function(b) {
        return squishy.equal(this.toArray(), b.toArray());
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the tuple of the tuples
    //  Monadic flatMap/bind
    //
    Tuple5.prototype.chain = function(f) {
        return f(this);
    };
    
    //
    //  ## isTuple2(a)
    //
    //  Returns `true` if `a` is `Tuple2`.
    //
    var isTuple2 = isInstanceOf(Tuple2);
    
    //
    //  ## isTuple4(a)
    //
    //  Returns `true` if `a` is `Tuple3`.
    //
    var isTuple3 = isInstanceOf(Tuple3);
    
    //
    //  ## isTuple4(a)
    //
    //  Returns `true` if `a` is `Tuple4`.
    //
    var isTuple4 = isInstanceOf(Tuple4);
    
    //
    //  ## isTuple5(a)
    //
    //  Returns `true` if `a` is `Tuple5`.
    //
    var isTuple5 = isInstanceOf(Tuple5);
    
    //
    //  ## isTuple(a)
    //
    //  Returns `true` if `a` is `Tuple`.
    //
    var isTuple = function(a) {
        return  isTuple2(a) ||
                isTuple3(a) ||
                isTuple4(a) ||
                isTuple5(a);
    };
    
    //
    //  ## arbTuple(a)
    //
    //  Returns an arbitrary `Tuple` with the right set of values.
    //
    var arbTuple = curry(function(t, n) {
        return function(a, s) {
            var env = this;
            return t.of.apply(this, env.map(
                env.fill(n)(function(i) {
                    return a.types[i];
                }),
                function(arg) {
                    return env.arb(arg, s);
                }
            ));
        };
    });
    
    //
    //  ## tuple2Of(a, b)
    //
    //  Sentinel value for when an tuple2 of a particular type is needed:
    //
    //       tuple2Of(Number, Number)
    //
    function tuple2Of(a, b) {
        var self = getInstance(this, tuple2Of);
        self.types = rest(arguments);
        return self;
    }
    
    //
    //  ## isTuple2Of(a)
    //
    //  Returns `true` if `a` is an instance of `tuple2Of`.
    //
    var isTuple2Of = isInstanceOf(tuple2Of);
    
    //
    //  ## tuple3Of(a, b, c)
    //
    //  Sentinel value for when an tuple3 of a particular type is needed:
    //
    //       tuple3Of(Number, Number, Number)
    //
    function tuple3Of(a, b, c) {
        var self = getInstance(this, tuple3Of);
        self.types = rest(arguments);
        return self;
    }
    
    //
    //  ## isTuple3Of(a)
    //
    //  Returns `true` if `a` is an instance of `tuple3Of`.
    //
    var isTuple3Of = isInstanceOf(tuple3Of);
    
    //
    //  ## tuple4Of(a, b, c, d)
    //
    //  Sentinel value for when an tuple4 of a particular type is needed:
    //
    //       tuple4Of(Number, Number, Number, Number)
    //
    function tuple4Of(a, b, c, d) {
        var self = getInstance(this, tuple4Of);
        self.types = rest(arguments);
        return self;
    }
    
    //
    //  ## isTuple4Of(a)
    //
    //  Returns `true` if `a` is an instance of `tuple4Of`.
    //
    var isTuple4Of = isInstanceOf(tuple4Of);
    
    //
    //  ## tuple5Of(a, b, c, d, e)
    //
    //  Sentinel value for when an tuple5 of a particular type is needed:
    //
    //       tuple5Of(Number, Number, Number, Number, Number)
    //
    function tuple5Of(a, b, c, d, e) {
        var self = getInstance(this, tuple5Of);
        self.types = rest(arguments);
        return self;
    }
    
    //
    //  ## isTuple5Of(a)
    //
    //  Returns `true` if `a` is an instance of `tuple5Of`.
    //
    var isTuple5Of = isInstanceOf(tuple5Of);
    
    //
    //  ### lens
    //
    //  Lens access for a object at a given property.
    //
    var lens = curry(function(ctor, index) {
        return Lens(function(a) {
            return Store(
                function(s) {
                    var m = a.toArray();
                    m[index] = s;
                    return ctor.of.apply(null, m);
                },
                function() {
                    return a.toArray()[index];
                }
            );
        });
    });
    
    //
    //  ### lens
    //
    //  Lens access for a object at a given property.
    //
    Tuple2.lens = lens(Tuple2);
    
    //
    //  ### lens
    //
    //  Lens access for a object at a given property.
    //
    Tuple3.lens = lens(Tuple3);
    
    //
    //  ### lens
    //
    //  Lens access for a object at a given property.
    //
    Tuple4.lens = lens(Tuple4);
    
    //
    //  ### lens
    //
    //  Lens access for a object at a given property.
    //
    Tuple5.lens = lens(Tuple5);
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Tuple2', Tuple2)
        .property('Tuple3', Tuple3)
        .property('Tuple4', Tuple4)
        .property('Tuple5', Tuple5)
        .property('tuple2Of', tuple2Of)
        .property('tuple3Of', tuple3Of)
        .property('tuple4Of', tuple4Of)
        .property('tuple5Of', tuple5Of)
        .property('isTuple2', isTuple2)
        .property('isTuple3', isTuple3)
        .property('isTuple4', isTuple4)
        .property('isTuple5', isTuple5)
        .property('isTuple2Of', isTuple2Of)
        .property('isTuple3Of', isTuple3Of)
        .property('isTuple4Of', isTuple4Of)
        .property('isTuple5Of', isTuple5Of)
        .method('arb', isTuple2Of, arbTuple(Tuple2, 2))
        .method('arb', isTuple3Of, arbTuple(Tuple3, 3))
        .method('arb', isTuple4Of, arbTuple(Tuple4, 4))
        .method('arb', isTuple5Of, arbTuple(Tuple5, 5))
        .method('shrink', isTuple, function(a, b) {
            return [];
        })
        .method('concat', isTuple, function(a, b) {
            return a.concat(b);
        })
        .method('equal', isTuple, function(a, b) {
            return a.equal(b);
        })
        .method('chain', isTuple, function(a, b) {
            return a.chain(b);
        })
        .method('toArray', isTuple, function(a, b) {
            return a.toArray();
        });

    //
    //  ## Promise(deferred)
    //
    //  Promise is a constructor which takes a `deferred` function. The `deferred`
    //  function takes two arguments:
    //
    //       deferred(resolve, reject)
    //
    //  `resolve` are side-effecting callbacks.
    //
    //  ### deferred(resolve, reject)
    //
    //  The `resolve` callback will be called with an `Attempt`. The `Attempt` can
    //  either be a Success or a Failure.
    //
    //  * `chain(f)` - Monadic flatMap/bind
    //  * `extend(f)` - Returns a new promise that evaluates `f` over the promise to get a value.
    //  * `extract()` - extract the value from promise
    //  * `map(f)` - Functor map for resolve
    //  * `reject(f)` - Functor map for reject
    //
    var Promise = tagged('Promise', ['fork']);
    
    //
    //  ### of(x)
    //
    //  Creates a Promise that contains a successful value.
    //
    Promise.of = function(x) {
        return Promise(
            function(resolve, reject) {
                return resolve(x);
            }
        );
    };
    
    //
    //  ### empty()
    //
    //  Creates a Empty Promise that contains no value.
    //
    Promise.empty = function() {
        return Promise.of();
    };
    
    //
    //  ### error(x)
    //
    //  Creates a Promise that contains a failure value.
    //
    Promise.error = function(x) {
        return Promise(
            function(resolve, reject) {
                return reject(x);
            }
        );
    };
    
    //
    //  ### chain(f)
    //
    //  Returns a new promise that evaluates `f` when the current promise
    //  is successfully fulfilled. `f` must return a new promise.
    //
    Promise.prototype.chain = function(f) {
        var env = this;
        return Promise(
            function(resolve, reject) {
                return env.fork(
                    function(a) {
                        return f(a).fork(resolve, reject);
                    },
                    reject
                );
            }
        );
    };
    
    //
    //  ### expand()
    //
    //  Returns a new promise that evaluates `f` over the promise to get a value.
    //
    Promise.prototype.expand = function(f) {
        var env = this;
        return env.map(
            function(a) {
                return f(Promise.of(a));
            }
        );
    };
    
    //
    //  ### extract()
    //
    //  Executes a promise to get a value.
    //
    Promise.prototype.extract = function() {
        return this.fork(
            identity,
            identity
        );
    };
    
    //
    //  ### map(f)
    //
    //  Returns a new promise that evaluates `f` on a value and passes it
    //  through to the resolve function.
    //
    Promise.prototype.map = function(f) {
        var env = this;
        return Promise(
            function(resolve, reject) {
                return env.fork(
                    function(a) {
                        return resolve(f(a));
                    },
                    reject
                );
            }
        );
    };
    
    //
    //  ### reject(f)
    //
    //  Returns a new promise that evaluates `f` when the current promise
    //  fails. `f` must return a new promise.
    //
    Promise.prototype.reject = function(f) {
        var env = this;
        return Promise(
            function(resolve, reject) {
                return env.fork(
                    resolve,
                    function(a) {
                        return f(a).fork(resolve, reject);
                    }
                );
            }
        );
    };
    
    //
    //  ## isPromise(a)
    //
    //  Returns `true` if `a` is `Promise`.
    //
    var isPromise = isInstanceOf(Promise);
    
    //
    //  ## Promise Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //
    
    var PromiseT = tagged('PromiseT', ['run']);
    
    Promise.PromiseT = transformer(PromiseT);
    
    //
    //  ### fork(a, b)
    //
    //  Open up fork from the reader transformer
    //
    PromiseT.prototype.fork = function(a, b) {
        return this.run.fork(a, b);
    };
    
    //
    //  ## isPromiseT(a)
    //
    //  Returns `true` if `a` is `PromiseT`.
    //
    var isPromiseT = isInstanceOf(PromiseT);
    
    //
    //  ## promiseOf(type)
    //
    //  Sentinel value for when an promise of a particular type is needed:
    //
    //       promiseOf(Number)
    //
    function promiseOf(type) {
        var self = getInstance(this, promiseOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isPromiseOf(a)
    //
    //  Returns `true` if `a` is an instance of `promiseOf`.
    //
    var isPromiseOf = isInstanceOf(promiseOf);
    
    //
    //  ## promiseTOf(type)
    //
    //  Sentinel value for when an promise of a particular type is needed:
    //
    //       promiseTOf(Number)
    //
    function promiseTOf(type) {
        var self = getInstance(this, promiseTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isPromiseTOf(a)
    //
    //  Returns `true` if `a` is an instance of `promiseTOf`.
    //
    var isPromiseTOf = isInstanceOf(promiseTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Promise.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an promise structure.
    //
    Promise.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return Promise(s);
                },
                function() {
                    return a.fork;
                }
            );
        });
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Promise', Promise)
        .property('PromiseT', PromiseT)
        .property('promiseOf', promiseOf)
        .property('promiseTOf', promiseTOf)
        .property('isPromise', isPromise)
        .property('isPromiseOf', isPromiseOf)
        .property('isPromiseTOf', isPromiseTOf)
        .method('of', strictEquals(Promise), function(x) {
            return Promise.of(x);
        })
        .method('empty', strictEquals(Promise), function() {
            return Promise.empty();
        })
    
        .method('arb', isPromiseOf, function(a, b) {
            return Promise.of(this.arb(a.type, b - 1));
        })
        .method('arb', isPromiseTOf, function(a, b) {
            return Promise.PromiseT(this.arb(promiseOf(a.type), b - 1));
        })
    
        .method('expand', isPromise, function(a, b) {
            return a.expand(b);
        })
        .method('extract', isPromise, function(a) {
            return a.extract();
        })
    
        .method('chain', squishy.liftA2(or, isPromise, isPromiseT), function(a, b) {
            return a.chain(b);
        })
        .method('map', squishy.liftA2(or, isPromise, isPromiseT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isPromise, isPromiseT), function(a, b) {
            return [];
        });

    //
    //  # Trampoline
    //
    //  Reifies continutations onto the heap, rather than the stack. Allows
    //  efficient tail calls.
    //
    //  Example usage:
    //
    //       function loop(n) {
    //           function inner(i) {
    //               if(i == n) return squishy.done(n);
    //               return squishy.cont(function() {
    //                   return inner(i + 1);
    //               });
    //           }
    //
    //           return squishy.trampoline(inner(0));
    //       }
    //
    //  Where `loop` is the identity function for positive numbers. Without
    //  trampolining, this function would take `n` stack frames.
    //
    
    //
    //  ## done(result)
    //
    //  Result constructor for a continuation.
    //
    function done(result) {
        var self = getInstance(this, done);
        self.isDone = true;
        self.result = result;
        return self;
    }
    
    //
    //  ## cont(thunk)
    //
    //  Continuation constructor. `thunk` is a nullary closure, resulting
    //  in a `done` or a `cont`.
    //
    function cont(thunk) {
        var self = getInstance(this, cont);
        self.isDone = false;
        self.thunk = thunk;
        return self;
    }
    
    //
    //  ## trampoline(bounce)
    //
    //  The beginning of the continuation to call. Will repeatedly evaluate
    //  `cont` thunks until it gets to a `done` value.
    //
    function trampoline(bounce) {
        while(!bounce.isDone) {
            bounce = bounce.thunk();
        }
        return bounce.result;
    }
    
    squishy = squishy
        .property('done', done)
        .property('cont', cont)
        .property('trampoline', trampoline);

    //
    //  ## Stream(fork)
    //
    //  The Stream type represents a flow of data ever evolving values over time.
    //
    //  Here is an example of a number piped through to the console.
    //
    //        Stream.of(1).map(
    //            function (a) {
    //                return a + 1;
    //            }
    //        ).fork(console.log);
    //
    //
    //   * `ap(a, b)` - Applicative ap(ply)
    //   * `concat(a, b)` - Appends two stream objects.
    //   * `drop(a, n)` - Returns the stream without its n first elements. If this stream has less than n elements, the empty stream is returned.
    //   * `filter(a, f)` - Returns all the elements of this stream that satisfy the predicate p.
    //   * `chain(a, f)` - Applies the given function f to each element of this stream, then concatenates the results.
    //   * `fold(a, v, f)` - Combines the elements of this stream together using the binary function f, from Left to Right, and starting with the value v.
    //   * `map(a, f)` - Returns the stream resulting from applying the given function f to each element of this stream.
    //   * `scan(a, f)` - Combines the elements of this stream together using the binary operator op, from Left to Right
    //   * `take(n)` - Returns the n first elements of this stream.
    //   * `zip(a, b)` - Returns a stream formed from this stream and the specified stream that by associating each element of the former with the element at the same position in the latter.
    //   * `zipWithIndex(a)` -  Returns a stream form from this stream and a index of the value that is associated with each element index position.
    //
    var Stream = tagged('Stream', ['fork']);
    
    //
    //  ### of(x)
    //
    //  Creates a stream that contains a successful value.
    //
    Stream.of = function(a) {
        return Stream(
            function(next, done) {
                squishy.toOption(a).fold(
                    next,
                    nothing
                );
                return done();
            }
        );
    };
    
    //
    //  ### empty()
    //
    //  Creates a Empty stream that contains no value.
    //
    Stream.empty = function() {
        return Stream.of();
    };
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the success of this stream
    //  Applicative ap(ply)
    //
    Stream.prototype.ap = function(a) {
        return this.chain(
            function(f) {
                return a.map(f);
            }
        );
    };
    
    //
    //  ### both(a)
    //
    //  returns a stream formed from this stream and the specified stream that
    //  by associating each element to the current element.
    //
    Stream.prototype.both = function(a, t) {
        var env = this,
            x = Tuple2.lens(0),
            y = Tuple2.lens(1);
    
        return Stream(
            function(next, done) {
                var end = once(function() {
                        return once(done);
                    });
    
                env.fork(
                    function(v) {
                        t = x.run(t).set(v);
                        next(t);
                    },
                    end
                );
    
                a.fork(
                    function(v) {
                        t = y.run(t).set(v);
                        next(t);
                    },
                    end
                );
            }
        );
    };
    
    //
    //  ### chain(f)
    //
    //  Returns a new stream that evaluates `f` when the current stream
    //  is successfully fulfilled. `f` must return a new stream.
    //
    Stream.prototype.chain = function(f) {
        var env = this;
        return Stream(function(next, done) {
            return env.fork(
                function(a) {
                    return f(a).fork(next, nothing);
                },
                done
            );
        });
    };
    
    //
    //  ### concat(s, f)
    //
    //  Concatenate two streams associatively together.
    //  Semigroup concat
    //
    Stream.prototype.concat = function(a) {
        var env = this;
        return Stream(function(next, done) {
            return env.fork(
                next,
                function() {
                    return a.fork(next, done);
                }
            );
        });
    };
    
    //
    //  ### drop(f)
    //
    //  Returns the stream without its n first elements.
    //
    Stream.prototype.drop = function(n) {
        var dropped = 0;
        return this.chain(
            function(a) {
                if (dropped < n) {
                    dropped++;
                    return Stream.empty();
                } else {
                    return Stream.of(a);
                }
            }
        );
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two stream values for equality
    //
    Stream.prototype.equal = function(a) {
        return this.zip(a).fold(
            true,
            function(v, t) {
                return v && squishy.equal(t._1, t._2);
            }
        );
    };
    
    //
    //  ### extract(a)
    //
    //  Extract the value from the stream.
    //
    Stream.prototype.extract = function() {
        return this.fork(
            identity,
            constant(null)
        );
    };
    
    //
    //  ### filter(f)
    //
    //  Returns all the elements of this stream that satisfy the predicate p.
    //
    Stream.prototype.filter = function(f) {
        var env = this;
        return Stream(function(next, done) {
            return env.fork(
                function(a) {
                    if (f(a)) {
                        next(a);
                    }
                },
                done
            );
        });
    };
    
    //
    //  ### fold(v, f)
    //
    //  Combines the elements of this stream together using the binary function f
    //
    Stream.prototype.fold = function(v, f) {
        var env = this;
        return Stream(
            function(next, done) {
                return env.fork(
                    function(a) {
                        v = f(v, a);
                        return v;
                    },
                    function() {
                        next(v);
                        return done();
                    }
                );
            }
        );
    };
    
    //
    //  ### length()
    //
    //  Returns the length of the stream
    //
    Stream.prototype.length = function() {
        return this.map(
            constant(1)
        ).fold(
            0,
            curry(function(x, y) {
                return x + y;
            })
        );
    };
    
    //
    //  ### map(f)
    //
    //  Returns the stream resulting from applying the given function f to each
    //  element of this stream.
    //
    Stream.prototype.map = function(f) {
        return this.chain(
            function(a) {
                return Stream.of(f(a));
            }
        );
    };
    
    //
    //  ### merge(a)
    //
    //  Merge the values of two streams in to one stream
    //
    Stream.prototype.merge = function(a) {
        var env = this;
    
        return Stream(
            function(next, done) {
                var end = once(done);
    
                env.fork(next, end);
                a.fork(next, end);
            }
        );
    };
    
    //
    //  ### pipe(a)
    //
    //  Pipe a stream to a state or writer monad.
    //
    Stream.prototype.pipe = function(o) {
        var env = this;
        return Stream(
            function(next, done) {
                return env.fork(
                    function(v) {
                        return o.run(v);
                    },
                    done
                );
            }
        );
    };
    
    //
    //  ### scan(a)
    //
    //  Combines the elements of this stream together using the binary operator
    //  op, from Left to Right
    //
    Stream.prototype.scan = function(a, f) {
        var env = this;
        return Stream(
            function(next, done) {
                return env.fork(
                    function(b) {
                        a = f(a, b);
                        return next(a);
                    },
                    done
                );
            });
    };
    
    //
    //  ### take(v, f)
    //
    //  Returns the n first elements of this stream.
    //
    Stream.prototype.take = function(n) {
        var taken = 0;
        return this.chain(
            function(a) {
                return (++taken < n) ? Stream.of(a) : Stream.empty();
            }
        );
    };
    
    //
    //  ### zip(b)
    //
    //  Returns a stream formed from this stream and the specified stream that
    //  by associating each element of the former with the element at the same
    //  position in the latter.
    //
    Stream.prototype.zip = function(a) {
        var env = this;
    
        return Stream(
            function(next, done) {
                var left = [],
                    right = [],
                    end = once(done);
    
                env.fork(
                    function(a) {
                        if (right.length > 0) {
                            next(Tuple2(a, right.shift()));
                        } else {
                            left.push(a);
                        }
                    },
                    end
                );
    
                a.fork(
                    function(a) {
                        if (left.length > 0) {
                            next(Tuple2(left.shift(), a));
                        } else {
                            right.push(a);
                        }
                    },
                    end
                );
            }
        );
    };
    
    //
    //  ### zipWithIndex()
    //
    //  Returns a stream form from this stream and a index of the value that
    //  is associated with each element index position.
    //
    Stream.prototype.zipWithIndex = function() {
        var index = 0;
        return this.map(
            function(a) {
                return Tuple2(a, index++);
            }
        );
    };
    
    //
    //  ## fromArray(a)
    //
    //  Returns a new stream which iterates over each element of the array.
    //
    Stream.fromArray = function(a) {
        return Stream(
            function(next, done) {
                squishy.map(a, next);
                return done();
            }
        );
    };
    
    //
    //  ## isStream(a)
    //
    //  Returns `true` if `a` is `Stream`.
    //
    var isStream = isInstanceOf(Stream);
    
    //
    //  ## Stream Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //
    
    var StreamT = tagged('StreamT', ['run']);
    
    Stream.StreamT = transformer(StreamT);
    
    //
    //  ### fork(a, b)
    //
    //  Open up fork from the reader transformer
    //
    StreamT.prototype.fork = function(a, b) {
        return this.run.fork(a, b);
    };
    
    //
    //  ## isStreamT(a)
    //
    //  Returns `true` if `a` is `StreamT`.
    //
    var isStreamT = isInstanceOf(StreamT);
    
    //
    //  ## streamOf(type)
    //
    //  Sentinel value for when an stream of a particular type is needed:
    //
    //       streamOf(Number)
    //
    function streamOf(type) {
        var self = getInstance(this, streamOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isStreamOf(a)
    //
    //  Returns `true` if `a` is `streamOf`.
    //
    var isStreamOf = isInstanceOf(streamOf);
    
    //
    //  ## streamTOf(type)
    //
    //  Sentinel value for when an stream of a particular type is needed:
    //
    //       streamTOf(Number)
    //
    function streamTOf(type) {
        var self = getInstance(this, streamTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isStreamTOf(a)
    //
    //  Returns `true` if `a` is an instance of `streamTOf`.
    //
    var isStreamTOf = isInstanceOf(streamTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Stream.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an reader structure.
    //
    Stream.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return Stream(s);
                },
                function() {
                    return a.fork;
                }
            );
        });
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Stream', Stream)
        .property('StreamT', StreamT)
        .property('streamOf', streamOf)
        .property('streamTOf', streamTOf)
        .property('isStream', isStream)
        .property('isStreamT', isStreamT)
        .property('isStreamOf', isStreamOf)
        .property('isStreamTOf', isStreamTOf)
        .method('of', strictEquals(Stream), function(x) {
            return Stream.of(x);
        })
        .method('empty', strictEquals(Stream), function() {
            return Stream.empty();
        })
    
        .method('arb', isStreamOf, function(a, b) {
            var args = this.arb(a.type, b - 1);
            return Stream.fromArray(args);
        })
        .method('arb', isStreamTOf, function(a, b) {
            return Stream.StreamT(this.arb(streamOf(a.type), b - 1));
        })
    
        .method('concat', isStream, function(a, b) {
            return a.chain(b);
        })
        .method('extract', isStream, function(a) {
            return a.extract();
        })
        .method('fold', isStream, function(a, b) {
            return a.chain(b);
        })
        .method('zip', isStream, function(b) {
            return a.zip(b);
        })
    
        .method('ap', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
            return a.ap(b);
        })
        .method('chain', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
            return a.chain(b);
        })
        .method('equal', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
            return a.equal(b);
        })
        .method('map', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
            return [];
        });

    //
    //  # Identity
    //
    //  The Identity monad is a monad that does not embody any computational
    //  strategy. It simply applies the bound function to its input without
    //  any modification.
    //
    //   * `ap(a)` - applicative ap(ply)
    //   * `chain(f)` - chain values
    //   * `concat(s, plus)` - Semigroup concat
    //   * `map(f)` - functor map
    //   * `toArray()` - `[x]` if `Identity(x)`
    //
    var Identity = tagged('Identity', ['x']);
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `Identity` for the value of `x`.
    //
    Identity.of = Identity;
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the value of the identity
    //  Applicative ap(ply)
    //
    Identity.prototype.ap = function(a) {
        return this.chain(function(f) {
            return squishy.map(a, f);
        });
    };
    
    //
    //  ### concat(b)
    //
    //  Concatenate two identities associatively together.
    //  Semigroup concat
    //
    Identity.prototype.concat = function(a) {
        var env = this;
        return this.map(function(f) {
            return squishy.concat(env.x, a.x);
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the value of the identity
    //  Monadic flatMap/bind
    //
    Identity.prototype.chain = function(f) {
        return f(this.x);
    };
    
    //
    //  ### equal(a)
    //
    //  Compare two option values for equality
    //
    Identity.prototype.equal = function(b) {
        return squishy.equal(this.x, b.x);
    };
    
    //
    //  ### map(f)
    //
    //  Map on the value of this identity.
    //  Functor map
    //
    Identity.prototype.map = function(f) {
        return this.chain(function(a) {
            return Identity.of(f(a));
        });
    };
    
    //
    //  ### negate(b)
    //
    //  Negate two identities associatively together.
    //
    Identity.prototype.negate = function() {
        var env = this;
        return this.map(function(f) {
            return squishy.negate(env.x);
        });
    };
    
    //
    //  ## isIdentity(a)
    //
    //  Returns `true` if `a` is `Identity`.
    //
    var isIdentity = isInstanceOf(Identity);
    
    //
    //  ## Identity Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //  * `equal(a)` - `true` if `a` is equal to `this`
    //
    
    var IdentityT = tagged('IdentityT', ['run']);
    
    Identity.IdentityT = transformer(IdentityT);
    
    //
    //  ## isIdentityT(a)
    //
    //  Returns `true` if `a` is `IdentityT`.
    //
    var isIdentityT = isInstanceOf(IdentityT);
    
    //
    //  ## identityOf(type)
    //
    //  Sentinel value for when an identity of a particular type is needed:
    //
    //       identityOf(Number)
    //
    function identityOf(type) {
        var self = getInstance(this, identityOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isIdentityOf(a)
    //
    //  Returns `true` if `a` is an instance of `identityOf`.
    //
    var isIdentityOf = isInstanceOf(identityOf);
    
    //
    //  ## identityTOf(type)
    //
    //  Sentinel value for when an identity of a particular type is needed:
    //
    //       identityTOf(Number)
    //
    function identityTOf(type) {
        var self = getInstance(this, identityTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isIdentityTOf(a)
    //
    //  Returns `true` if `a` is an instance of `identityTOf`.
    //
    var isIdentityTOf = isInstanceOf(identityTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Identity.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an attempt structure.
    //
    Identity.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return Identity.of(s);
                },
                function() {
                    return a.x;
                }
            );
        });
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Identity', Identity)
        .property('IdentityT', Identity.IdentityT)
        .property('identityOf', identityOf)
        .property('identityTOf', identityTOf)
        .property('isIdentity', isIdentity)
        .property('isIdentityOf', isIdentityOf)
        .property('isIdentityT', isIdentityT)
        .property('isIdentityTOf', isIdentityTOf)
        .method('of', strictEquals(Identity), function(x) {
            return Identity.of(x);
        })
        .method('empty', strictEquals(Identity), function(x) {
            return Identity.empty();
        })
    
        .method('arb', isIdentityOf, function(a, b) {
            return Identity(this.arb(a.type, b - 1));
        })
        .method('arb', isIdentityTOf, function(a, b) {
            return Identity.IdentityT(this.arb(identityOf(a.type), b - 1));
        })
    
        .method('concat', isIdentity, function(a, b) {
            return a.concat(b);
        })
        .method('negate', isIdentity, function(a) {
            return a.negate();
        })
        .method('toArray', isIdentity, function(a) {
            return a.toArray();
        })
    
        .method('ap', squishy.liftA2(or, isIdentity, isIdentityT), function(a, b) {
            return a.ap(b);
        })
        .method('equal', squishy.liftA2(or, isIdentity, isIdentityT), function(a, b) {
            return a.equal(b);
        })
        .method('chain', squishy.liftA2(or, isIdentity, isIdentityT), function(a, b) {
            return a.chain(b);
        })
        .method('map', squishy.liftA2(or, isIdentity, isIdentityT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isIdentity, isIdentityT), function(a) {
            return [];
        });

    //
    //  # Input/output
    //
    //  Purely functional IO wrapper.
    //
    
    //
    //   ## IO(f)
    //
    //   Pure wrapper around a side-effecting `f` function.
    //
    //   * `unsafePerform()` - action to be called a single time per program
    //   * `ap(b, concat)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `map(f)` - Functor map
    //
    var IO = tagged('IO', ['unsafePerform']);
    
    IO.of = function(x) {
        return IO(function() {
            return x;
        });
    };
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of IO
    //  Applicative ap(ply)
    //
    IO.prototype.ap = function(a) {
        return this.chain(function(f) {
            return squishy.map(a, f);
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the f of an IO
    //  Monadic flatMap/bind
    //
    IO.prototype.chain = function(f) {
        var env = this;
        return IO(function() {
            return f(env.unsafePerform()).unsafePerform();
        });
    };
    
    //
    //  ### map(f)
    //
    //  Map on the f of this IO.
    //  Functor map
    //
    IO.prototype.map = function(f) {
        return this.chain(function(a) {
            return IO.of(f(a));
        });
    };
    
    //
    //  ## isIO(a)
    //
    //  Returns `true` if `a` is an `io`.
    //
    var isIO = isInstanceOf(IO);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(IO.prototype);
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('IO', IO)
        .property('isIO', isIO)
        .method('of', strictEquals(IO), function(m, a) {
            return IO.of(a);
        })
        .method('ap', isIO, function(a, b) {
            return a.ap(b);
        })
        .method('chain', isIO, function(a, b) {
            return a.chain(b);
        })
        .method('map', isIO, function(a, b) {
            return a.map(b);
        });

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
    //  ### toPartail
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
    //  ### identityLens
    //
    //  Identity partial lens that returns the original target.
    //
    PartialLens.identityLens = function() {
        return PartialLens(function(target) {
            return Option.Some(Lens.identity().run(target));
        });
    };
    
    //
    //  ### objectLens
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
    //  ### arrayLens
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
    //  ### andThen
    //
    //  Helper method to enable chaining of lens objects.
    //
    PartialLens.prototype.andThen = function(b) {
        return b.compose(this);
    };
    
    //
    //  ### compose
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

    //
    //  ## Reader(run)
    //
    //  Reader represents a computation, which can read values, passes values from
    //  function to functions.
    //
    //   * `ap(b, concat)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `map(f)` - Functor map
    //
    var Reader = tagged('Reader', ['run']);
    
    //
    //  ## ask(x)
    //
    //  Constructs a `Reader` from the current value.
    //
    Reader.ask = Reader(function(e) {
        return e;
    });
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating a `Reader`.
    //
    Reader.of = function(a) {
        return Reader(function(e) {
            return a;
        });
    };
    
    //
    //  ## empty()
    //
    //  Constructor `empty` Monad creating a `Reader`.
    //
    Reader.empty = function() {
        return Reader(nothing);
    };
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the value of this reader
    //  Applicative ap(ply)
    //
    Reader.prototype.ap = function(a) {
        return this.chain(function(f) {
            return squishy.map(a, f);
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the value of the reader
    //  Monadic flatMap/bind
    //
    Reader.prototype.chain = function(f) {
        var env = this;
        return Reader(function(e) {
            return f(env.run(e)).run(e);
        });
    };
    
    //
    //  ### map(f)
    //
    //  Map on the value of this reader.
    //  Functor map
    //
    Reader.prototype.map = function(f) {
        return this.chain(function(a) {
            return Reader.of(f(a));
        });
    };
    
    //
    //  ## isReader(a)
    //
    //  Returns `true` if `a` is `Reader`.
    //
    var isReader = isInstanceOf(Reader);
    
    //
    //  ## Reader Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //
    
    var ReaderT = tagged('ReaderT', ['run']);
    
    Reader.ReaderT = transformer(ReaderT);
    
    //
    //  ## isReaderT(a)
    //
    //  Returns `true` if `a` is `ReaderT`.
    //
    var isReaderT = isInstanceOf(ReaderT);
    
    //
    //  ## readerOf(type)
    //
    //  Sentinel value for when an reader of a particular type is needed:
    //
    //       readerOf(Number)
    //
    function readerOf(type) {
        var self = getInstance(this, readerOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isReaderOf(a)
    //
    //  Returns `true` if `a` is an instance of `readerOf`.
    //
    var isReaderOf = isInstanceOf(readerOf);
    
    //
    //  ## readerTOf(type)
    //
    //  Sentinel value for when an reader of a particular type is needed:
    //
    //       readerTOf(Number)
    //
    function readerTOf(type) {
        var self = getInstance(this, readerTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isReaderTOf(a)
    //
    //  Returns `true` if `a` is an instance of `readerTOf`.
    //
    var isReaderTOf = isInstanceOf(readerTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Reader.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an reader structure.
    //
    Reader.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return Reader(s);
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
        .property('Reader', Reader)
        .property('ReaderT', ReaderT)
        .property('readerOf', readerOf)
        .property('readerTOf', readerTOf)
        .property('isReader', isReader)
        .property('isReaderOf', isReaderOf)
        .property('isReaderTOf', isReaderTOf)
        .method('of', strictEquals(Reader), function(x) {
            return Reader.of(x);
        })
        .method('empty', strictEquals(Reader), function() {
            return Reader.empty();
        })
    
        .method('arb', isReaderOf, function(a, b) {
            return Reader.of(this.arb(a.type, b - 1));
        })
        .method('arb', isReaderTOf, function(a, b) {
            return Reader.ReaderT(this.arb(readerOf(a.type), b - 1));
        })
    
        .method('ap', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
            return a.ap(b);
        })
        .method('chain', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
            return a.chain(b);
        })
        .method('map', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isReader, isReaderT), function(a, b) {
            return [];
        });

    //
    //   ## Writer(run)
    //
    //  Writer represents a computation, which can write values, passes values from
    //  function to functions.
    //
    //   * `ap(b, concat)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `map(f)` - Functor map
    //
    var Writer = tagged('Writer', ['run']);
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating a `Writer`.
    //
    Writer.of = function(a) {
        return Writer(function() {
            return Tuple2(a, '');
        });
    };
    
    //
    //  ## empty()
    //
    //  Constructor `empty` Monad creating a `Writer`.
    //
    Writer.empty = function() {
        return Writer(function() {
            return Tuple2(null, '');
        });
    };
    
    //
    //  ## put()
    //
    //  Constructor `put` to return the value of `t`.
    //
    Writer.put = function(t) {
        return Writer(function() {
            return t;
        });
    };
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the value of this writer
    //  Applicative ap(ply)
    //
    Writer.prototype.ap = function(a) {
        return this.chain(function(f) {
            return squishy.map(a, function(b) {
                return f(b);
            });
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the value of the writer
    //  Monadic flatMap/bind
    //
    Writer.prototype.chain = function(f) {
        var env = this;
        return Writer(function(e) {
            var a = env.run(e),
                b = f(a._1).run(a._1);
    
            return Tuple2(b._1, squishy.concat(a._2, b._2));
        });
    };
    
    //
    //  ### map(f)
    //
    //  Map on the value of this writer.
    //  Functor map
    //
    Writer.prototype.map = function(f) {
        return this.chain(function(a) {
            return Writer.of(f(a));
        });
    };
    
    //
    //  ## isWriter(a)
    //
    //  Returns `true` if `a` is `Writer`.
    //
    var isWriter = isInstanceOf(Writer);
    
    //
    //  ## Writer Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //
    
    var WriterT = tagged('WriterT', ['run']);
    
    Writer.WriterT = transformer(WriterT);
    
    //
    //  ## isWriterT(a)
    //
    //  Returns `true` if `a` is `WriterT`.
    //
    var isWriterT = isInstanceOf(WriterT);
    
    //
    //  ## writerOf(type)
    //
    //  Sentinel value for when an writer of a particular type is needed:
    //
    //       writerOf(Number)
    //
    function writerOf(type) {
        var self = getInstance(this, writerOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isWriterOf(a)
    //
    //  Returns `true` if `a` is an instance of `writerOf`.
    //
    var isWriterOf = isInstanceOf(writerOf);
    
    //
    //  ## writerTOf(type)
    //
    //  Sentinel value for when an writer of a particular type is needed:
    //
    //       writerTOf(Number)
    //
    function writerTOf(type) {
        var self = getInstance(this, writerTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isWriterTOf(a)
    //
    //  Returns `true` if `a` is an instance of `writerTOf`.
    //
    var isWriterTOf = isInstanceOf(writerTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Writer.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an state structure.
    //
    Writer.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return Writer(s);
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
        .property('Writer', Writer)
        .property('WriterT', WriterT)
        .property('writerOf', writerOf)
        .property('writerTOf', writerTOf)
        .property('isWriter', isWriter)
        .property('isWriterT', isWriterT)
        .property('isWriterOf', isWriterOf)
        .property('isWriterTOf', isWriterTOf)
        .method('of', strictEquals(Writer), function(x) {
            return Writer.of(x);
        })
        .method('empty', strictEquals(Writer), function(x) {
            return Writer.empty();
        })
    
        .method('arb', isWriterOf, function(a, b) {
            return Writer.of(this.arb(a.type, b - 1));
        })
        .method('arb', isWriterTOf, function(a, b) {
            return Writer.WriterT(this.arb(writerOf(a.type), b - 1));
        })
    
        .method('ap', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
            return a.ap(b);
        })
        .method('chain', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
            return a.chain(b);
        })
        .method('map', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
            return a.map(b);
        })
        .method('shrink', squishy.liftA2(or, isWriter, isWriterT), function(a, b) {
            return [];
        });

    //
    //  ## State(run)
    //
    //  Monadic state.
    //
    //   * `ap(b, concat)` - Applicative ap(ply)
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `map(f)` - Functor map
    //
    var State = tagged('State', ['run']);
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating a `State`.
    //
    State.of = function(a) {
        return State(function(b) {
            return Tuple2(a, b);
        });
    };
    
    //
    //  ## get()
    //
    //  Constructor `get` to retrieve the state value.
    //
    State.get = State(function(s) {
        return Tuple2(s, s);
    });
    
    //
    //  ## modify(f)
    //
    //  Constructor `modify` to alter the state value using the function.
    //
    State.modify = function(f) {
        return State(function(s) {
            return Tuple2(null, f(s));
        });
    };
    
    //
    //  ## put(s)
    //
    //  Constructor `put` to return the value of `s`.
    //
    State.put = function(s) {
        return State.modify(function(a) {
            return s;
        });
    };
    
    //
    //  ### ap(b)
    //
    //  Apply a function in the environment of the value of this state
    //  Applicative ap(ply)
    //
    State.prototype.ap = function(a) {
        return this.chain(function(f) {
            return squishy.map(a, f);
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Bind through the value of the state
    //  Monadic flatMap/bind
    //
    State.prototype.chain = function(f) {
        var env = this;
        return State(function(s) {
            var result = env.run(s);
            return f(result._1).run(result._2);
        });
    };
    
    //
    //  ### evalState(s)
    //
    //  Evaluate the state with `s`.
    //
    State.prototype.evalState = function(s) {
        return this.run(s)._1;
    };
    
    //
    //  ### execState(s)
    //
    //  Execute the state with `s`.
    //
    State.prototype.execState = function(s) {
        return this.run(s)._2;
    };
    
    //
    //  ### map(f)
    //
    //  Map on the value of this state.
    //  Functor map
    //
    State.prototype.map = function(f) {
        return this.chain(function(a) {
            return State.of(f(a));
        });
    };
    
    // Transformer
    State.StateT = function(M) {
    
        //
        //  Monadic state transformer.
        //
        //   * `ap(b, concat)` - Applicative ap(ply)
        //   * `chain(f)` - Monadic flatMap/bind
        //   * `map(f)` - Functor map
        //
        var StateT = tagged('StateT', ['run']);
    
        //
        //  ## lift(m)
        //
        //  Constructor `lift` Monad creating a `StateT`.
        //
        StateT.lift = function(m) {
            return StateT(function(b) {
                return m;
            });
        };
    
        //
        //  ## of(x)
        //
        //  Constructor `of` Monad creating a `StateT`.
        //
        StateT.of = function(a) {
            return StateT(function(b) {
                return M.of(Tuple2(a, b));
            });
        };
    
        //
        //  ## get()
        //
        //  Constructor `get` to retrieve the stateT value.
        //
        StateT.get = StateT(function(s) {
            return M.of(Tuple2(s, s));
        });
    
        //
        //  ## modify(f)
        //
        //  Constructor `modify` to alter the stateT value using the function.
        //
        StateT.modify = function(f) {
            return StateT(function(s) {
                return M.of(Tuple2(null, f(s)));
            });
        };
    
        //
        //  ## put(s)
        //
        //  Constructor `put` to return the value of s.
        //
        StateT.put = function(s) {
            return StateT.modify(function(a) {
                return s;
            });
        };
    
        //
        //  ### ap(b)
        //
        //  Apply a function in the environment of the value of this stateT
        //  Applicative ap(ply)
        //
        StateT.prototype.ap = function(a) {
            return this.chain(function(f) {
                return squishy.map(a, f);
            });
        };
    
        //
        //  ### chain(f)
        //
        //  Bind through the value of the stateT
        //  Monadic flatMap/bind
        //
        StateT.prototype.chain = function(f) {
            var state = this;
            return StateT(function(s) {
                var result = state.run(s);
                return result.chain(function(t) {
                    return f(t._1).run(t._2);
                });
            });
        };
    
        //
        //  ### evalState(s)
        //
        //  Evaluate the stateT with `s`.
        //
        StateT.prototype.evalState = function(s) {
            return this.run(s).chain(function(t) {
                return t._1;
            });
        };
    
        //
        //  ### execState(s)
        //
        //  Execute the stateT with `s`.
        //
        StateT.prototype.execState = function(s) {
            return this.run(s).chain(function(t) {
                return t._2;
            });
        };
    
        //
        //  ### map(f)
        //
        //  Map on the value of this stateT.
        //  Functor map
        //
        StateT.prototype.map = function(f) {
            return this.chain(function(a) {
                return StateT.of(f(a));
            });
        };
    
        return StateT;
    };
    
    //
    //  ## isState(a)
    //
    //  Returns `true` if `a` is `State`.
    //
    var isState = isInstanceOf(State);
    
    //
    //  ## stateOf(type)
    //
    //  Sentinel value for when an state of a particular type is needed:
    //
    //       stateOf(Number)
    //
    function stateOf(type) {
        var self = getInstance(this, stateOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isStateOf(a)
    //
    //  Returns `true` if `a` is an instance of `stateOf`.
    //
    var isStateOf = isInstanceOf(stateOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(State.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an state structure.
    //
    State.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return State(s);
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
        .property('State', State)
        .property('isState', isState)
        .property('stateOf', stateOf)
        .property('isStateOf', isStateOf)
        .method('of', strictEquals(State), function(x) {
            return State.of(x);
        })
        .method('ap', isState, function(a, b) {
            return a.ap(b);
        })
        .method('chain', isState, function(a, b) {
            return a.chain(b);
        })
        .method('map', isState, function(a, b) {
            return a.map(b);
        })
        .method('arb', isStateOf, function(a, b) {
            return State.of(this.arb(a.type, b - 1));
        })
        .method('shrink', isState, function(a, b) {
            return [];
        });

    //
    //  # List
    //
    //      List a = Cons a + Nil
    //
    //  The list type data type constructs objects which points to values. The `Cons`
    //  constructor represents a value, the left is the head (the first element)
    //  and the right represents the tail (the second element). The `Nil`
    //  constructor is defined as an empty list.
    //
    //  The following example creates a list of values 1 and 2, where the Nil terminates
    //  the list:
    //
    //      Cons(1, Cons(2, Nil));
    //
    //  The following can also represent tree like structures (Binary Trees):
    //
    //      Cons(Cons(1, Cons(2, Nil)), Cons(3, Cons(4, Nil)));
    //
    //             *
    //            / \
    //           *   *
    //          / \ / \
    //         1  2 3  4
    //
    //   * `ap(a, b)` - Applicative ap(ply)
    //   * `append(a)` - append
    //   * `appendAll(a)` - append values
    //   * `chain(f)` - monadic flatMap
    //   * `concat(a)` - semigroup concat
    //   * `count(a, f)` - Count the number of elements in the list which satisfy a predicate.
    //   * `drop(a, n)` - Returns the list without its n first elements. If this list has less than n elements, the empty list is returned.
    //   * `dropRight(a, n)` - Returns the list without its rightmost `n` elements.
    //   * `dropWhile(a, f)` - Returns the longest suffix of this list whose first element does not satisfy the predicate.
    //   * `exists()` - test by predicate
    //   * `extract()` -  extract the value from option
    //   * `equal(a)` -  `true` if `a` is equal to `this`
    //   * `filter()` - filter by predicate
    //   * `find(a)` - Returns the element in this list of an element that satisfies the predicate.
    //   * `first(a)` - Retrieve the first value.
    //   * `fold(a, b)` - applies `a` to value if `Cons` or defaults to `b`
    //   * `last(a)` - Retrieve the last value.
    //   * `map(f)` - functor map
    //   * `prepend(a)` - prepend value
    //   * `prependAll(a)` - prepend values
    //   * `reverse()` - reverse
    //   * `partition()` - partition by predicate
    //   * `reduce(a, f)` - Combines the elements of this list together using the binary operator op, from Left to Right
    //   * `reduceRight(a, f)` - Combines the elements of this list together using the binary operator op, from Right to Left
    //   * `size()` - size of the list
    //   * `tail(n)` - Returns the tail elements of this list.
    //   * `take(n)` - Returns the n first elements of this list.
    //   * `takeRight(n)` - Returns the rightmost n elements from this list.
    //   * `takeWhile(f)` - Returns the longest prefix of this list whose elements satisfy the predicate.
    //   * `zip(a, b)` - Returns a list formed from this list and the specified list that by associating each element of the former with the element at the same position in the latter.
    //   * `zipWithIndex(a)` -  Returns a list form from this list and a index of the value that is associated with each element index position.
    //   * `toArray()` - Returns a array from a list.
    //
    var List = taggedSum('List', {
        Cons: ['head', 'tail'],
        Nil: []
    });
    
    //
    //  ### range(a, b)
    //
    //  Create a list from a range of values.
    //
    List.range = curry(function(a, b) {
        var total = b - a;
        var rec = function(x, y) {
            if (y - a >= total) return done(x);
            return cont(function() {
                return rec(List.Cons(y, x), ++y);
            });
        };
        return trampoline(rec(List.Nil, a));
    });
    
    //
    //  ### fromArray()
    //
    //  Returns a list from an array.
    //
    List.fromArray = function(array) {
        var index = array.length,
            accum = List.Nil;
    
        while(--index > -1) {
            accum = accum.prepend(array[index]);
        }
    
        return accum;
    };
    
    //
    //  ### ap(b, [concat])
    //
    //  Apply a function in the applicative of each function
    //  Applicative ap(ply)
    //
    List.prototype.ap = function(b) {
        var accum = List.Nil,
            a = this,
            x = b;
    
        while(a.isNonEmpty) {
            b = x;
            while(b.isNonEmpty) {
                accum = accum.prepend(a.head(b.head));
                b = b.tail;
            }
            a = a.tail;
        }
    
        return accum.reverse();
    };
    
    //
    //  ### append(a)
    //
    //  Append a value to the current list returning a new list.
    //
    List.prototype.append = function(a) {
        return this.appendAll(List.Cons(a, List.Nil));
    };
    
    //
    //  ### appendAll(a)
    //
    //  Append a list of values to the current list returning a new list.
    //
    List.prototype.appendAll = function(a) {
        var accum = a;
        var p = this.reverse();
    
        while(p.isNonEmpty) {
            accum = List.Cons(p.head, accum);
            p = p.tail;
        }
    
        return accum;
    };
    
    //
    //  ### chain(f)
    //
    //  Applies the given function f to each element of this list, then
    //  concatenates the results.
    //
    List.prototype.chain = function(f) {
        return this.fold(
            List.Nil,
            function(a, b) {
                return a.appendAll(f(b));
            }
        );
    };
    
    //
    //  ### concat(s)
    //
    //  Appends two list objects.
    //  semigroup concat
    //
    List.prototype.concat = function(s) {
        return this.appendAll(s);
    };
    
    //
    //  ### count(f)
    //
    //  Count the number of elements in the list which satisfy a predicate.
    //
    List.prototype.count = function(f) {
        var rec = function(a, b) {
            if (a.isEmpty) return done(b);
    
            return cont(function() {
                return rec(a.tail, f(a.head) ? inc(b) : b);
            });
        };
        return trampoline(rec(this, 0));
    };
    
    //
    //  ### drop(n)
    //
    //  Returns the list without its n first elements. If this list has less than n elements, the empty list is returned.
    //
    List.prototype.drop = function(n) {
        var rec = function(a, b) {
            if (a.isEmpty || b < 1) return done(a);
    
            return cont(function() {
                return rec(a.tail, --b);
            });
        };
        return trampoline(rec(this, n));
    };
    
    //
    //  ### dropRight(n)
    //
    //  Returns the list without its rightmost `n` elements.
    //
    List.prototype.dropRight = function(n) {
        if (n < 1) return List.Nil;
    
        var rec = function(a, b, c) {
            if (a.isEmpty || c < 1) return done(b);
    
            return cont(function() {
                return rec(a.tail, b.prepend(a.head), --c);
            });
        };
        return trampoline(rec(this, List.Nil, this.size() - n)).reverse();
    };
    
    //
    //  ### dropWhile(f)
    //
    //  Returns the longest suffix of this array whose first element
    //  does not satisfy the predicate.
    //
    List.prototype.dropWhile = function(f) {
        var env = this,
            rec = function(a, b) {
                if (a.isEmpty) return done(0);
                else if(!f(a.head)) return done(b);
    
                return cont(function() {
                    return rec(a.tail, ++b);
                });
            },
            index = trampoline(rec(this, 0));
    
        return this.drop(index);
    };
    
    //
    //  ### exists(f)
    //
    //  Tests the existence in this list of an element that satisfies
    //  the predicate.
    //
    List.prototype.exists = function(f) {
        var p = this;
    
        while(p.isNonEmpty) {
            if(f(p.head)) {
                return true;
            }
            p = p.tail;
        }
        return false;
    };
    
    //
    //  ### extract()
    //
    //  Extract the value from the list.
    //
    List.prototype.extract = function() {
        return this.match({
            Cons: function(a) {
                return a;
            },
            Nil: constant(null)
        });
    };
    
    //
    //  ### equal(b)
    //
    //  Compare two list values for equality
    //
    List.prototype.equal = function(b) {
        var accum = true,
            a = this;
        while(a.isNonEmpty && b.isNonEmpty) {
            accum = accum && squishy.equal(a.head, b.head);
    
            if (!accum) {
                break;
            }
    
            a = a.tail;
            b = b.tail;
        }
        return accum ? a.isEmpty && b.isEmpty : false;
    };
    
    //
    //  ### filter(f)
    //
    //  Returns all the elements of this list that satisfy the predicate p.
    //
    List.prototype.filter = function(f) {
        var rec = function(a, b) {
            if (a.isEmpty) return done(b);
    
            return cont(function() {
                var c = curry(rec)(a.tail);
                if (f(a.head)) {
                    return c(List.Cons(a.head, b));
                } else {
                    return c(b);
                }
            });
        };
        return trampoline(rec(this, List.Nil)).reverse();
    };
    
    //
    //  ### find(f)
    //
    //  Returns the element in this list of an element that satisfies the predicate.
    //
    List.prototype.find = function(f) {
        var rec = function(a) {
            if (a.isEmpty) return done(null);
    
            return cont(function() {
                if (f(a.head)) {
                    return done(a.head);
                } else {
                    return rec(a.tail);
                }
            });
        };
        return trampoline(rec(this));
    };
    
    //
    //  ### first()
    //
    //  Retrieve the first value.
    //
    List.prototype.first = function() {
        return a.head;
    };
    
    //
    //  ### fold(v, f)
    //
    //  Combines the elements of this list together using the binary function f,
    //  from Left to Right, and starting with the value v.
    //
    List.prototype.fold = function(v, f) {
        var rec = function(a, b) {
            if (a.isEmpty) return done(b);
    
            return cont(function() {
                return rec(a.tail, f(b, a.head));
            });
        };
        return trampoline(rec(this, v));
    };
    
    //
    //  ### get(index)
    //
    //  Get the given item at the correct index
    //
    List.prototype.get = function(index) {
        var accum = null,
            i = -1,
            p = this;
    
        while(p.isNonEmpty && i < index) {
            accum = p.head;
            p = p.tail;
            i++;
        }
        return accum;
    };
    
    //
    //  ### last()
    //
    //  Retrieve the last value.
    //
    List.prototype.last = function() {
        var rec = function(a) {
            if (a.isEmpty) return done(null);
    
            return cont(function() {
                if (a.tail.isEmpty) {
                    return done(a.head);
                } else {
                    return rec(a.tail);
                }
            });
        };
        return trampoline(rec(this));
    };
    
    //
    //  ### map(f)
    //
    //  Returns the list resulting from applying the given function f to each
    //  element of this list.
    //
    List.prototype.map = function(f) {
        return this.fold(
            List.Nil,
            function(a, b) {
                return List.Cons(f(b), a);
            }
        );
    };
    
    //
    //  ### partition(f)
    //
    //  Partition the list in two sub-lists according to a predicate.
    //
    List.prototype.partition = function(f) {
        if (this.isEmpty) return Tuple2(this, this);
    
        var rec = function(a, l, r) {
            if (a.isEmpty) return done(Tuple2(l.reverse(), r.reverse()));
    
            return cont(function() {
                var h = a.head;
                var cur = curry(List.Cons)(h);
                if (f(h)) {
                    return rec(a.tail, cur(l), r);
                } else {
                    return rec(a.tail, l, cur(r));
                }
            });
        };
        return trampoline(rec(this, List.Nil, List.Nil));
    };
    
    //
    //  ### prepend(a)
    //
    //  Prepend a value to the current list returning a new list.
    //
    List.prototype.prepend = function(a) {
        return List.Cons(a, this);
    };
    
    //
    //  ### prependAll(a)
    //
    //  Prepend a list of values to the current list returning a new list.
    //
    List.prototype.prependAll = function(a) {
        var rec = function(a, b) {
            if (a.isEmpty) return done(b);
    
            return cont(function() {
                return rec(a.tail, List.Cons(a.head, b));
            });
        };
        return trampoline(rec(a, this));
    };
    
    //
    //  ### reduce(f)
    //
    //  Combines the elements of this list together using the binary operator
    //  op, from Left to Right
    //
    List.prototype.reduce = function(f) {
        if (this.isEmpty) return null;
    
        var rec = function(a, b) {
            if (a.isEmpty) return done(b);
    
            return cont(function() {
                return rec(a.tail, f(b, a.head));
            });
        };
        return trampoline(rec(this.tail, this.head));
    };
    
    //
    //  ### reduceRight(f)
    //
    //  Combines the elements of this list together using the binary operator
    //  op, from Right to Left
    //
    List.prototype.reduceRight = function(f) {
        return this.reverse().reduce(f);
    };
    
    //
    //  ### reverse()
    //
    //  Reverse the list as a new list.
    //
    List.prototype.reverse = function() {
        var rec = function(p, accum) {
            return p.match({
                Cons: function(a, b) {
                    return cont(function() {
                        return rec(p.tail, List.Cons(a, accum));
                    });
                },
                Nil: function() {
                    return done(accum);
                }
            });
        };
        return trampoline(rec(this, List.Nil));
    };
    
    //
    //  ### size()
    //
    //  size of the list
    //
    List.prototype.size = function() {
        var rec = function(a, b) {
            if (a.isEmpty) return done(b);
    
            return cont(function() {
                return rec(a.tail, ++b);
            });
        };
        return trampoline(rec(this, 0));
    };
    
    //
    //  ### take(n)
    //
    //  Returns the n first elements of this list.
    //
    List.prototype.take = function(n) {
        var accum = List.Nil,
            i = 0,
            p = this;
    
        while(p.isNonEmpty && i < n) {
            accum = List.Cons(p.head, accum);
            p = p.tail;
            i++;
        }
        return accum.reverse();
    };
    
    //
    //  ### takeRight(n)
    //
    //  Returns the rightmost n elements from this list.
    //
    List.prototype.takeRight = function(n) {
        if (n < 1) return this;
    
        var rec = function(a, b, c) {
            if (a.isEmpty || c < 1) return done(b);
    
            return cont(function() {
                return rec(a.tail, b.prepend(a.head), --c);
            });
        };
        return trampoline(rec(this.reverse(), List.Nil, n));
    };
    
    //
    //  ### takeWhile(f)
    //
    //  Returns the longest prefix of this list whose elements satisfy
    //  the predicate.
    //
    List.prototype.takeWhile = function(f) {
        var env = this,
            rec = function(a, b) {
                if (a.isEmpty) return done(0);
                else if(!f(a.head)) return done(b);
    
                return cont(function() {
                    return rec(a.tail, ++b);
                });
            },
            index = trampoline(rec(this, 0));
    
        return this.take(index);
    };
    
    //
    //  ### zip(b)
    //
    //  Returns a list formed from this list and the specified list that
    //  by associating each element of the former with the element at the same
    //  position in the latter.
    //
    List.prototype.zip = function(b) {
        var accum = List.Nil,
            x = this,
            y = b;
    
        while(x.isNonEmpty && y.isNonEmpty) {
            accum = List.Cons(Tuple2(x.head, y.head), accum);
            x = x.tail;
            y = y.tail;
        }
        return accum.reverse();
    };
    
    //
    //  ### zipWithIndex(b)
    //
    //  Returns a list form from this list and a index of the value that
    //  is associated with each element index position.
    //
    List.prototype.zipWithIndex = function(b) {
        var accum = List.Nil,
            index = 0,
            p = this;
    
        while(p.isNonEmpty) {
            accum = List.Cons(Tuple2(p.head, index++), accum);
            p = p.tail;
        }
        return accum.reverse();
    };
    
    //
    //  ## Cons(a, b)
    //
    //  Constructor to represent the existence of a value in a list, `a`
    //  and a reference to another `b`.
    //
    List.Cons.prototype.isEmpty = false;
    List.Cons.prototype.isNonEmpty = true;
    
    //
    //  ## Nil
    //
    //  Represents an empty list (absence of a list).
    //
    List.Nil.isEmpty = true;
    List.Nil.isNonEmpty = false;
    
    //
    //  ## of(x)
    //
    //  Constructor `of` Monad creating `List.Cons` with value of `x`.
    //
    List.of = function(x) {
        return List.Cons(x, List.Nil);
    };
    
    //
    //  ## empty()
    //
    //  Constructor `empty` Monad creating `List.Nil`.
    //
    List.empty = function() {
        return List.Nil;
    };
    
    //
    //  ## isList(a)
    //
    //  Returns `true` if `a` is a `Cons` or `Nil`.
    //
    var isList = isInstanceOf(List);
    
    //
    //  ## List Transformer
    //
    //  The trivial monad transformer, which maps a monad to an equivalent monad.
    //
    //  * `chain(f)` - chain values
    //  * `map(f)` - functor map
    //  * `ap(a)` - applicative ap(ply)
    //  * `equal(a)` - `true` if `a` is equal to `this`
    //
    
    var ListT = tagged('ListT', ['run']);
    
    List.ListT = transformer(ListT);
    
    //
    //  ## isListT(a)
    //
    //  Returns `true` if `a` is `ListT`.
    //
    var isListT = isInstanceOf(ListT);
    
    //
    //  ## listOf(type)
    //
    //  Sentinel value for when an list of a particular type is needed:
    //
    //       listOf(Number)
    //
    function listOf(type) {
        var self = getInstance(this, listOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isListOf(a)
    //
    //  Returns `true` if `a` is an instance of `listOf`.
    //
    var isListOf = isInstanceOf(listOf);
    
    //
    //  ## listTOf(type)
    //
    //  Sentinel value for when an list of a particular type is needed:
    //
    //       listTOf(Number)
    //
    function listTOf(type) {
        var self = getInstance(this, listTOf);
        self.type = type;
        return self;
    }
    
    //
    //  ## isListTOf(a)
    //
    //  Returns `true` if `a` is an instance of `listTOf`.
    //
    var isListTOf = isInstanceOf(listTOf);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(List.prototype);
    
    //
    //  ### lens
    //
    //  Lens access for an list at a given index.
    //
    List.lens = function(index) {
        return Lens(function(a) {
            return Store(
                function(s) {
                    var accum = List.Nil,
                        lens = List.Cons.lens(),
                        p = a;
    
                    while(p.isNonEmpty) {
                        accum = List.Cons(p.head, accum);
    
                        if (--index === -1) {
                            accum = lens.run(accum).set(s);
                        }
    
                        p = p.tail;
                    }
    
                    return accum.reverse();
                },
                function() {
                    return a.get(index);
                }
            );
        });
    };
    
    //
    //  ### lens
    //
    //  Lens access for an list.cons.
    //
    List.Cons.lens = function() {
        return Lens(function(a) {
            return Store(
                function(s) {
                    return List.Cons(s, a.tail);
                },
                function() {
                    return a.head;
                }
            );
        });
    };
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('List', List)
        .property('ListT', ListT)
        .property('Cons', List.Cons)
        .property('Nil', List.Nil)
        .property('isList', isList)
        .property('listOf', listOf)
        .property('listTOf', listTOf)
        .property('isListOf', isListOf)
        .property('isListTOf', isListTOf)
        .property('listRange', List.range)
        .method('of', strictEquals(List), function(x) {
            return List.of(x);
        })
        .method('empty', strictEquals(List), function(x) {
            return List.empty();
        })
    
        .method('arb', isListOf, function(a, b) {
            var accum = List.Nil,
                length = this.randomRange(0, b),
                i;
    
            for(i = 0; i < length; i++) {
                accum = accum.prepend(this.arb(a.type, b - 1));
            }
    
            return accum.reverse();
        })
        .method('arb', isListTOf, function(a, b) {
            return List.ListT(this.arb(listOf(a.type), b - 1));
        })
    
        .method('shrink', isList, function(a) {
            var accum = [List.Nil],
                x = a.size();
    
            while(x) {
                x = Math.floor(x / 2);
    
                if (x) accum.push(a.take(x));
            }
    
            return accum;
        })
        .method('shrink', isListT, function(a) {
            return [];
        })
    
        .method('concat', isList, function(a, b) {
            return a.concat(b);
        })
        .method('count', isList, function(a, b) {
            return a.count(b);
        })
        .method('drop', isList, function(a, b) {
            return a.drop(b);
        })
        .method('dropRight', isList, function(a, b) {
            return a.dropRight(b);
        })
        .method('dropWhile', isList, function(a, b) {
            return a.dropWhile(b);
        })
        .method('exists', isList, function(a, f) {
            return a.exists(f);
        })
        .method('find', isList, function(a, f) {
            return a.find(f);
        })
        .method('first', isList, function(a) {
            return a.first();
        })
        .method('fold', isList, function(a, f, g) {
            return a.fold(f, g);
        })
        .method('last', isList, function(a) {
            return a.last();
        })
        .method('partition', isList, function(a, f) {
            return a.partition(f);
        })
        .method('reduce', isList, function(a, f) {
            return a.reduce(f);
        })
        .method('reduceRight', isList, function(a, f) {
            return a.reduceRight(f);
        })
        .method('take', isList, function(a, b) {
            return a.take(b);
        })
        .method('takeRight', isList, function(a, b) {
            return a.takeRight(b);
        })
        .method('zip', isList, function(a, b) {
            return a.zip(b);
        })
        .method('zipWithIndex', isList, function(a, b) {
            return a.zipWithIndex(b);
        })
        .method('toArray', isList, function(a) {
            return a.toArray();
        })
    
        .method('ap', squishy.liftA2(or, isList, isListT), function(a, b) {
            return a.ap(b);
        })
        .method('chain', squishy.liftA2(or, isList, isListT), function(a, b) {
            return a.chain(b);
        })
        .method('equal', squishy.liftA2(or, isList, isListT), function(a, b) {
            return a.equal(b);
        })
        .method('map', squishy.liftA2(or, isList, isListT), function(a, b) {
            return a.map(b);
        });

    //
    //   # Parser
    //
    //   A monadic LL(infinity) parser.
    //
    //        var alpha = _.Parser.regexp(/^[a-zA-Z]+/),
    //            number = _.Parser.regexp(/^[\+\-]?\d+(\.\d+)?/),
    //            expr = alpha.orElse(number);
    //        expr.parse('1.1');
    //
    //   * `chain(f)` - Monadic flatMap/bind
    //   * `also(f)` - FlatMap/bind with concatenation of results
    //   * `many` - Yield array of results
    //   * `map(f)` - Functor map
    //   * `orElse(a)` - Default parser or else try alternative
    //   * `skip` - Skip the parser
    //   * `parse` - Executes parser
    //
    var Parser = tagged('Parser', ['run']);
    
    //
    //  ### of(x)
    //
    //  Creates a parser that contains a successful value.
    //
    Parser.of = function(a) {
        return Parser(function() {
            return Tuple4(a, 0, Attempt.of([]), Option.None);
        });
    };
    
    //
    //  ### empty()
    //
    //  Creates a parser that contains a empty value.
    //
    Parser.empty = function() {
        return Parser(function(a) {
            return Tuple4(a, 0, Attempt.of([]), Option.None);
        });
    };
    
    //
    //  ### fail(x)
    //
    //  Creates a parser that contains a failed value.
    //
    Parser.fail = function(e) {
        return Parser(function(a, b) {
            return Tuple4(a, b, Attempt.Failure([e]), Option.of([e]));
        });
    };
    
    //
    //  ### success(x)
    //
    //  Creates a parser that contains a successful value.
    //
    Parser.success = function(s) {
        return Parser(function(a, b) {
            return Tuple4(a, b, Attempt.of(s), Option.None);
        });
    };
    
    //
    //  ### put(x)
    //
    Parser.put = function(a) {
        return Parser(function() {
            return a;
        });
    };
    
    //
    //  ### regexp(x)
    //
    //  Parser that expects the stream to match the given regex.
    //
    Parser.regexp = function(a) {
        return Parser(function(stream, index, attempt, possibleFailure) {
            var value = stream.slice(index),
                match = a.exec(value),
                result;
            if(match) {
                result = match[0];
                return Tuple4(stream, index + result.length, Attempt.of([result]), possibleFailure);
            } else {
                return Tuple4(stream, index, Attempt.Failure([[value, index]]), possibleFailure);
            }
        });
    };
    
    //
    //  ### string(x)
    //
    //  Parser that expects to find a string, and will yield the same.
    //
    Parser.string = function(a) {
        var length = a.length;
        return Parser(function(stream, index, attempt, possibleFailure) {
            var value = stream.slice(index, index + length);
            if (value === a) {
                return Tuple4(stream, index + length, Attempt.of([value]), possibleFailure);
            } else {
                return Tuple4(stream, index, Attempt.Failure([[value, index]]), possibleFailure);
            }
        });
    };
    
    //
    //  ### chain(f)
    //
    //  Expects another Parser to follow parser, and yields the result of
    //  another Parser.
    //
    Parser.prototype.chain = function(f) {
        var env = this;
        return Parser(function(stream, index, attempt, possibleFailure) {
            var outcome = env.run(stream, index, attempt, possibleFailure);
            return outcome._3.fold(
                function(x) {
                    var a = f(outcome._1, outcome._2, outcome._3, outcome._4);
                    return a.run(outcome._1, outcome._2, outcome._3, outcome._4);
                },
                function() {
                    return Tuple4(outcome._1, outcome._2, outcome._3, outcome._4);
                }
            );
        });
    };
    
    //
    //  ### also(f)
    //
    //  Expects another Parser to follow parser, and concatenates the result of
    //  both Parser results.
    //
    Parser.prototype.also = function(f) {
        var env = this;
        return Parser(function(stream, index, attempt, possibleFailure) {
            var outcome = env.run(stream, index, attempt, possibleFailure);
            return outcome._3.fold(
                function(x) {
                    var a = f(outcome._1, outcome._2, outcome._3, outcome._4);
                    var b = a.run(outcome._1, outcome._2, outcome._3, outcome._4);
                    return b._3.fold(
                        function(y) {
                            var c = Attempt.of([squishy.concat(x[0], y)]);
                            return Tuple4(b._1, b._2, c, b._4);
                        },
                        function() {
                            return b;
                        }
                    );
                },
                function() {
                    return Tuple4(outcome._1, outcome._2, outcome._3, outcome._4);
                }
            );
        });
    };
    
    //
    //  ### many()
    //
    //  Expects parser zero or more times, and yields an array of the results.
    //
    Parser.prototype.many = function() {
        var env = this,
            recursive = function(stream) {
                return function rec(index, attempt, values) {
                    return attempt.fold(
                        function() {
                            var outcome = env.run(stream, index, attempt, Option.None);
                            return outcome._3.fold(
                                function(x) {
                                    var y = squishy.concat(values, x);
                                    return rec(outcome._2, outcome._3, y);
                                },
                                function() {
                                    return Tuple3(index, values, outcome._3.fold(
                                        constant(outcome._3),
                                        function(x) {
                                            return outcome._4.fold(
                                                function(y) {
                                                    return Attempt.Failure(y);
                                                },
                                                function() {
                                                    return Attempt.Failure(x);
                                                }
                                            );
                                        }
                                    ));
                                }
                            );
                        },
                        function() {
                            return Tuple3(index, values, attempt);
                        }
                    );
                };
            };
        return Parser(function(stream, index, attempt) {
            var outcome = recursive(stream)(index, attempt, []),
                possibleFailure = outcome._3.fold(
                    Option.empty,
                    Option.of
                );
            return Tuple4(stream, outcome._1, Attempt.of([outcome._2]), possibleFailure);
        });
    };
    
    //
    //  ### map(f)
    //
    //  Transforms the output of parser with the given function.
    //
    Parser.prototype.map = function(f) {
        return this.chain(function(stream, index, attempt, possibleFailure) {
            return attempt.fold(
                function(x) {
                    return Parser.put(Tuple4(stream, index, Attempt.of(f(x)), possibleFailure));
                },
                function() {
                    return Parser.put(Tuple4(stream, index, attempt, possibleFailure));
                }
            );
        });
    };
    
    //
    //  ### orElse(a)
    //
    Parser.prototype.orElse = function(a) {
        var env = this;
        return Parser(function(stream, index, attempt, possibleFailure) {
            var outcome = env.run(stream, index, attempt, possibleFailure);
            return outcome._3.fold(
                function() {
                    return outcome;
                },
                function() {
                    var possible = a.run(stream, index, attempt, possibleFailure);
                    return possible._3.fold(
                        function() {
                            return Tuple4(possible._1, possible._2, possible._3, possible._4);
                        },
                        function() {
                            return Tuple4(stream, index, outcome._3, outcome._4);
                        }
                    );
                }
            );
        });
    };
    
    //
    //  ### skip(a)
    //
    //  Returns a new parser which tries parser, and if it fails uses otherParser.
    //
    Parser.prototype.skip = function(a) {
        return this.chain(function(stream, index, attempt, possibleFailure) {
            return a.chain(function() {
                return Parser(function(stream, index, _, d) {
                    return Tuple4(stream, index, attempt, possibleFailure);
                });
            });
        });
    };
    
    //
    //  ### parse(stream)
    //
    //  Executes the parser with the given stream.
    //
    Parser.prototype.parse = function(stream) {
        var result = this.skip(eof).run(stream, 0, Attempt.of([]), Option.None);
        return result._3.fold(
            constant(result._3),
            function(x) {
                return result._4.fold(
                    function(y) {
                        return Attempt.Failure(y);
                    },
                    constant(result._3)
                );
            }
        );
    };
    
    //
    //  ### eof()
    //
    //  Expects the end of the stream.
    //
    var eof = Parser(function(stream, index, attempt, possibleFailure) {
        var outcome = index <= stream.length ? attempt : Attempt.Failure(['EOF', index]);
        return Tuple4(stream, index, outcome, possibleFailure);
    });
    
    //
    //  ## isParser(a)
    //
    //  Returns `true` if `a` is `Parser`.
    //
    var isParser = isInstanceOf(Parser);
    
    //
    //  ### Fantasy Overload
    //
    fo.unsafeSetValueOf(Parser.prototype);
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('Parser', Parser)
        .property('isParser', isParser)
        .method('chain', isParser, function(a, b) {
            return a.chain(b);
        })
        .method('map', isParser, function(a, b) {
            return a.map(b);
        });

    //
    //   # Match
    //
    //   Monad pattern matching.
    //
    //      var m = _.match([
    //                    ['Cons(Some(a), _)', function(a) { return a; }],
    //                    ['Cons(None, _)', function(x, y, z) { return 0; }],
    //                    ['_', function() { return -1; }]);
    //          m(_.Cons(_.Some(1), _.Nil));
    //
    //   * `match(patterns)(value)` - Construction.
    //
    var match = (function() {
    
        //
        //  ## Token
        //
        //  The token type encodes the presence of a certain data type from
        //  the parser.
        //
        var Token = taggedSum('Token', {
                TString: ['string'],
                TNumber: ['number'],
                TIdent: ['ident'],
                TWildcard: []
            }),
    
            //
            //  ### isToken(a)
            //
            //  Returns `true` if `a` is an instance of `token`.
            //
            isToken = isInstanceOf(Token),
    
            //
            //  ### Parser
            //
            //  Monadic parser creation.
            //
            regexp = Parser.regexp,
            string = Parser.string,
            word = regexp(/^.[^"]*/),
            quote = regexp(/^"/),
            number = regexp(/^[\+\-]?\d+(\.\d+)?/),
            ident = regexp(/^[a-zA-Z\_][a-zA-Z0-9\_\-\.]*/),
            wildcard = regexp(/^\_/),
            comma = regexp(/^(\s|\,|\s)*/),
            leftBracket = string('('),
            rightBracket = string(')'),
            optionalWhitespace = regexp(/^\s*/),
            emptyString = string(''),
            wildcardAsString = '_',
    
            /* Tokens */
            stringToken = quote.chain(function() {
                return word.skip(quote);
            }).map(function(a) {
                return Token.TString(a);
            }),
            emptyStringToken = quote.chain(function() {
                return emptyString.skip(quote);
            }).map(function() {
                return Token.TString(['']);
            }),
            numberToken = number.map(function(a) {
                return Token.TNumber(parseFloat(a, 10));
            }),
            identToken = ident.map(function(a) {
                return Token.TIdent(a);
            }),
            wildcardToken = wildcard.map(function() {
                return Token.TWildcard;
            }),
    
            /* Block */
            block = identToken.many().also(function() {
                return leftBracket.skip(optionalWhitespace).chain(function() {
                    return expr.many().skip(rightBracket);
                });
            }),
            expr = block.orElse(wildcardToken)
                        .orElse(emptyStringToken)
                        .orElse(stringToken)
                        .orElse(numberToken)
                        .orElse(identToken)
                        .skip(comma),
            parser = block.orElse(wildcardToken)
                          .orElse(identToken),
    
            /* Start extracting the possible patterns */
            extract = curry(function(args, key, x) {
                var result = recursiveMatch(args, x, key),
                    flattened = squishy.chain(result, function(a) {
                        return recursiveFlatten([a]);
                    }),
                    failed = squishy.exists(flattened, function(a) {
                        return a.isFailure;
                    }),
                    filtered,
                    mapped;
    
                if (failed) {
                    return Option.None;
                } else {
                    filtered = squishy.filter(flattened, function(a) {
                        return !a.value.isWildcard;
                    });
                    mapped = squishy.map(filtered, function(a) {
                        return a.extract();
                    });
                    return Option.of(mapped);
                }
            }),
    
            //
            //  ## match(patterns)
            //
            //  Constructor for the patterns expression.
            //
            match = function(patterns) {
                var env = this,
                    compile = compiler();
    
                return function(argument) {
                    var key = Token.TIdent([functionName(argument)]),
                        args = supplied(argument, fields(argument, key)).getOrElse(constant([])),
                        result = until(patterns, function(c) {
                            var result = compile(c[0]),
                                value = result.fold(
                                    extract(args, key),
                                    constant(result)
                                );
    
                            return value.map(
                                function(x) {
                                    return c[1].apply(env, x);
                                }
                            );
                        });
    
                    return result.fold(
                        identity,
                        function() {
                            /* Handle the default case */
                            var defaultCase = env.find(patterns, function(x) {
                                return x[0] === wildcardAsString;
                            });
                            if (isArray(defaultCase)) {
                                return defaultCase[1].apply(this, []);
                            }
    
                            throw new TypeError('No default case found.');
                        }
                    );
                };
            };
    
        /* Get the head of the parsed stream */
        function head(a) {
            if (isArray(a)) {
                return squishy.flatten(a)[0];
            }
            return a;
        }
    
        /* Get the tail of the parsed stream */
        function tail(a) {
            if (isArray(a)) {
                return a[0].slice(1)[0];
            }
            return [a];
        }
    
        /* Recursively flatten the arguments */
        function recursiveFlatten(a) {
            return squishy.fold(a, [], function(x, y) {
                return squishy.concat(x, isArray(y) ? recursiveFlatten(y) : y);
            });
        }
    
        /* Compile the stream into an array and cache the results for later */
        function compiler() {
            var cache = {};
            return function(stream) {
                var result;
                if (!(stream in cache)) {
                    result = parser.parse(stream).fold(
                        Option.of,
                        Option.empty
                    );
    
                    cache[stream] = result;
                }
                return cache[stream];
            };
        }
    
        /* Return the siblings of the taggedSum  */
        function siblings(value) {
            if (isObject(value) && value._constructors) {
                return Object.keys(value._constructors);
            }
            return [];
        }
    
        /* Return the fields of the taggedSum */
        function fields(a, b) {
            var key = b.isIdent ? Option.of(b.ident) : Option.empty();
            return key.match({
                Some: function(x) {
                    return a._constructors[x];
                },
                None: constant([])
            });
        }
    
        /* Return the values from the value using the fields of the taggedSum */
        function supplied(value, fields) {
            if(isArray(fields) && fields.length > 0) {
                return Option.Some(squishy.select(value, fields));
            }
            return Option.None;
        }
    
        /* Continue to iterate through the array until an Option.Some is located */
        function until(a, f) {
            var result,
                i;
    
            for(i = 0; i < a.length; i++) {
                result = f(a[i]);
                if (result.isSome) {
                    return result;
                }
            }
    
            return Option.None;
        }
    
        /* Recursively match the parsed stream values against the taggedSum values */
        function recursiveMatch(args, a, key) {
            var zipped,
                rest;
    
            if (head(a).equal(key)) {
    
                zipped = squishy.zip(tail(a), args);
    
                return squishy.map(
                    zipped,
                    function(tuple) {
                        var name = tuple._1,
                            value = tuple._2,
                            possibleKey = Token.TIdent([functionName(value)]),
                            possibleArgs,
                            possibleSibling;
    
                        if (squishy.isArray(name)) {
                            possibleArgs = supplied(value, fields(value, possibleKey));
    
                            return possibleArgs.fold(
                                function(x) {
                                    return recursiveMatch(x, [name], possibleKey);
                                },
                                function() {
                                    return Attempt.Failure(['Invalid tokens']);
                                }
                            );
                        } else if (!name.isWildcard) {
                            possibleSibling = squishy.exists(siblings(value), function(x) {
                                return name.isIdent ? squishy.equal(name.ident[0], x) : false;
                            });
    
                            if (possibleSibling && name.similar(value)) {
                                return Attempt.of(Token.TWildcard);
                            } else if(!possibleSibling && name.isIdent) {
                                return Attempt.of(value);
                            } else if(name.equal(value) || name.similar(value)) {
                                return Attempt.of(value);
                            }
    
                            return Attempt.Failure(['Invalid token']);
                        } else {
                            return Attempt.of(Token.TWildcard);
                        }
                    }
                );
            } else {
                return [Attempt.Failure(['Invalid namespace', head(a), key])];
            }
        }
    
        //
        //  ## equal(b)
        //
        //  Compare two option values for equality
        //
        Token.prototype.equal = function(b) {
            if (b.wildcard) return true;
    
            var env = this;
            return env.match({
                TIdent: function(x) {
                    var last0 = squishy.last(env.namespace()),
                        last1 = b.isIdent ? squishy.last(b.namespace()) : [];
                    return squishy.equal(last0, last1);
                },
                TNumber: function(x) {
                    return b.isNumber && squishy.equal(b.number, x);
                },
                TString: function(x) {
                    return b.isString && squishy.equal(b.string, x);
                },
                TWildcard: constant(true)
            });
        };
    
        //
        //  ## similar(b)
        //
        //  Compare two option values for similarity
        //
        Token.prototype.similar = function(b) {
            if (b.wildcard) return true;
    
            return this.match({
                TIdent: function(c) {
                    return squishy.equal(c[0], functionName(b));
                },
                TNumber: function(c) {
                    return isNumber(b) && squishy.equal(c, b);
                },
                TString: function(c) {
                    return isString(b) && squishy.equal(c[0], b);
                },
                TWildcard: constant(true)
            });
        };
    
        Token.TIdent.prototype.namespace = function() {
            return this.ident.join('').split('.');
        };
    
        //
        //  ## TIdent(x)
        //
        //  Constructor to represent the ident token with a value, `x`.
        //
        Token.TIdent.prototype.isIdent = true;
        Token.TIdent.prototype.isNumber = false;
        Token.TIdent.prototype.isString = false;
        Token.TIdent.prototype.isWildcard = false;
    
        //
        //  ## TNumber(x)
        //
        //  Constructor to represent the number token with a value, `x`.
        //
        Token.TNumber.prototype.isIdent = false;
        Token.TNumber.prototype.isNumber = true;
        Token.TNumber.prototype.isString = false;
        Token.TNumber.prototype.isWildcard = false;
    
        //
        //  ## TString(x)
        //
        //  Constructor to represent the string token with a value, `x`.
        //
        Token.TString.prototype.isIdent = false;
        Token.TString.prototype.isNumber = false;
        Token.TString.prototype.isString = true;
        Token.TString.prototype.isWildcard = false;
    
        //
        //  ## TWildcard(x)
        //
        //  Constructor to represent the wildcard token.
        //
        Token.TWildcard.isIdent = false;
        Token.TWildcard.isNumber = false;
        Token.TWildcard.isString = false;
        Token.TWildcard.isWildcard = true;
    
        //
        //  Return the match function
        //
        return match;
    })();
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('match', match);

    /* Bellow includes are optional */
    //
    //  ## once
    //
    //  Stateful function that guarantees that the function is evaluated
    //  only once. Executes a complex function with arguments once, even
    //  if called multiple times.
    //
    //       once(
    //           function(a) {
    //               return Math.sin(a);
    //           }, 1
    //       )();
    //
    /* This is really stateful and we should really consider its use. */
    /* Use with care */
    function once(f) {
        /* Create a special lock so we don't have to look for undefined */
        var args = rest(arguments).slice(1),
            lock = {},
            val = lock;
    
        return function() {
            if (val === lock) val = f.apply(null, args);
            return val;
        };
    }
    
    //
    //  ## asyncOnce
    //
    //  Stateful async function that guarantees that the function is evaluated
    //  only once. Executes a complex function with arguments once, even
    //  if called multiple times.
    //
    //       asyncOnce(
    //           function(resolve, args) {
    //               setTimeout(function() {
    //                  resolve(Math.sin(args[0]));
    //               }, 100);
    //           }, 1
    //       )();
    //
    /* This is really stateful and we should really consider its use. */
    /* Use with care */
    function asyncOnce(f) {
        var args = rest(arguments).slice(1),
            resolves = [],
            stateful = function(args) {
                captured = args;
            },
            invoke = function(args) {
                var index = resolves.length;
    
                while(--index > -1) {
                    optional(resolves.pop()).apply(null, args);
                }
            },
            deferred = once(function() {
                f.apply(null, [
                    function() {
                        var args = rest(arguments);
    
                        stateful(args);
                        invoke(args);
                    },
                    args
                ]);
            }),
            captured;
    
        return function(f) {
            deferred();
    
            if (captured) f.apply(null, captured);
            else resolves.push(f);
        };
    }
    
    
    //
    //  append methods to the squishy environment.
    //
    squishy = squishy
        .property('once', once)
        .property('asyncOnce', asyncOnce);

    if (typeof exports != 'undefined') {
        /*jshint node: true*/
        exports = module.exports = squishy;
    } else {
        global.squishy = squishy;
    }
})(this);