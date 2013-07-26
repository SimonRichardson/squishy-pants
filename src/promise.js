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
var Promise = function Promise(deferred) {
    var self = getInstance(this, Promise);

    /* It would be nice to be able to remove the state */
    var attempt,
        append = curry(function(a, b) {
            a.push(b);
            return a;
        })([]),
        removeAndInvoke = function(a, b) {
            for (var i = a.length - 1; i > -1; i--) {
                var f = a.pop();
                b.match({
                    Success: f[0],
                    Failure: f[1]
                });
            }
        },
        curriedDeferred = function(listeners) {
            if (listeners.length - 1 < 1) {
                deferred(
                    function(data) {
                        attempt = Attempt.Success(data);
                        removeAndInvoke(listeners, attempt);
                    },
                    function(errors) {
                        attempt = Attempt.Failure(errors);
                        removeAndInvoke(listeners, attempt);
                    }
                );
            }
        };

    self.fork = function(resolve, reject) {
        if (attempt) {
            attempt.match({
                Success: resolve,
                Failure: reject
            });
        } else {
            curriedDeferred(append([resolve, reject]));
        }
    };

    return self;
};

//
//  ### Promise.of(x)
//
//  Creates a Promise that contains a successful value.
//
Promise.of = function(x) {
    return new Promise(function(resolve, reject) {
        resolve(x);
    });
};

//
//  ### `Promise.error(x)`
//
//  Creates a Promise that contains a failure value.
//
Promise.error = function(x) {
    return new Promise(function(resolve, reject) {
        reject(x);
    });
};

//
//  ### flatMap(f)
//
//  Returns a new promise that evaluates `f` when the current promise
//  is successfully fulfilled. `f` must return a new promise.
//
Promise.prototype.flatMap = function(f) {
    var promise = this;
    return new Promise(function(resolve, reject) {
        return promise.fork(
            function(a) {
                f(a).fork(resolve, reject);
            },
            reject
        );
    });
};

//
//  ### map(f)
//
//  Returns a new promise that evaluates `f` on a value and passes it
//  through to the resolve function.
//
Promise.prototype.map = function(f) {
    var promise = this;
    return new Promise(function(resolve, reject) {
        return promise.fork(function(a) {
            resolve(f(a));
        }, reject);
    });
};

//
//  ### `reject(f)`
//
//  Returns a new promise that evaluates `f` when the current promise
//  fails. `f` must return a new promise.
//
Promise.prototype.reject = function(f) {
    var promise = this;
    return new Promise(function(resolve, reject) {
        promise.fork(resolve, function(a) {
            f(a).fork(resolve, reject);
        });
    });
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
    .method('flatMap', isPromise, function(a, b) {
        return a.flatMap(b);
    })
    .method('map', isPromise, function(a, b) {
        return a.map(b);
    });
