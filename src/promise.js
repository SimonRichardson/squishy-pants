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
