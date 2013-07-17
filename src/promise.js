//
//  ## Promise(deferred)
//
//  Promise is a constructor which takes a `deferred` function. The `deferred`
//  function takes two arguments:
//
//       deferred(resolve, reject)
//
//  Both `resolve` and `reject` are side-effecting callbacks.
//
//  ### deferred(resolve, reject)
//
//  The `resolve` callback gets called on a "successful" value. The
//  `reject` callback gets called on a "failure" value.
//
var Promise = function(deferred) {
    var listeners = [],
        dispatched = false,
        attempt;

    this.fork = function(resolve, reject) {
        if (attempt) {
            attempt.match({
                success: function(data) {
                    resolve(data);
                },
                failure: function(errors) {
                    reject(errors);
                }
            });
        } else {
            listeners.push({
                resolve: resolve,
                reject: reject
            });

            if (!dispatched) {
                dispatched = true;

                deferred(
                    function(data) {
                        attempt = Attempt.success(data);
                        for (var i = 0; i < listeners.length; i++) {
                            listeners[i].resolve(data);
                        }
                    },
                    function(errors) {
                        attempt = Attempt.failure(errors);
                        for (var i = 0; i < listeners.length; i++) {
                            listeners[i].reject(data);
                        }
                    }
                );
            }
        }
    };
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
//  ### chain(f)
//
//  Returns a new promise that evaluates `f` when the current promise
//  is successfully fulfilled. `f` must return a new promise.
//
Promise.prototype.chain = function(f) {
    var promise = this;
    return new Promise(function(resolve, reject) {
        promise.fork(function(a) {
            f(a).fork(resolve, reject);
        }, reject);
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
    .property('isPromise', isPromise);
