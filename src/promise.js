//
//  ## Promise(deferred)
//
//  Promise is a constructor which takes a `deferred` function. The `deferred`
//  function takes two arguments:
//
//       deferred(resolve)
//
//  `resolve` are side-effecting callbacks.
//
//  ### deferred(resolve)
//
//  The `resolve` callback will be called with an `Attempt`. The `Attempt` can
//  either be a Success or a Failure.
//
function Promise(fork) {
    var self = getInstance(this, Promise);
    self.fork = fork;
    return self;
}

//
//  ### Promise.of(x)
//
//  Creates a Promise that contains a successful value.
//
Promise.of = function(x) {
    return Promise(
        function(resolve, reject) {
            resolve(x);
        }
    );
};

//
//  ### `Promise.error(x)`
//
//  Creates a Promise that contains a failure value.
//
Promise.error = function(x) {
    return Promise(
        function(resolve, reject) {
            reject(x);
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
    var promise = this;
    return Promise(
        function(resolve, reject) {
            promise.fork(
                function(a) {
                    f(a).fork(resolve, reject);
                },
                reject
            );
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
        function(a) {
            return a;
        },
        function(e) {
            return e;
        }
    );
};

//
//  ### map(f)
//
//  Returns a new promise that evaluates `f` on a value and passes it
//  through to the resolve function.
//
Promise.prototype.map = function(f) {
    var promise = this;
    return Promise(
        function(resolve, reject) {
            promise.fork(
                function(a) {
                    resolve(f(a));
                },
                reject
            );
        }
    );
};

//
//  ### `reject(f)`
//
//  Returns a new promise that evaluates `f` when the current promise
//  fails. `f` must return a new promise.
//
Promise.prototype.reject = function(f) {
    var promise = this;
    return Promise(
        function(resolve, reject) {
            promise.fork(
                resolve,
                function(a) {
                    f(a).fork(resolve, reject);
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
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Promise', Promise)
    .property('isPromise', isPromise)
    .method('chain', isPromise, function(a, b) {
        return a.chain(b);
    })
    .method('extract', isPromise, function(a) {
        return a.extract();
    })
    .method('map', isPromise, function(a, b) {
        return a.map(b);
    })
    .method('arb', isPromise, function(a, b) {
        return Promise.of(this.arb(AnyVal, b - 1));
    });
