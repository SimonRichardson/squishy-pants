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
//  either be a success or a failure.
//
var Promise = function(deferred) {
    /* It would be nice to be able to remove the state */
    var attempt,
        append = curry(function(a, b) {
            a.push(b);
            return a;
        })([]),
        removeAndInvoke = function(a, b) {
            for (var i = a.length - 1; i > -1; i--) {
                a.pop()(b);
            }
        },
        curriedDeferred = function(listeners) {
            if (listeners.length - 1 < 1) {
                deferred(function(data) {
                    attempt = data;
                    removeAndInvoke(listeners, data);
                });
            }
        };

    this.fork = function(resolve) {
        if (attempt) {
            resolve(attempt);
        } else {
            curriedDeferred(append(resolve));
        }
    };
};

//
//  ### Promise.of(x)
//
//  Creates a Promise that contains a successful value.
//
Promise.of = function(x) {
    return new Promise(function(resolve) {
        resolve(squishy.map(x, function(a) {
            return Attempt.success(a);
        }));
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
    return new Promise(function(resolve) {
        promise.fork(function(a) {
            f(a).fork(resolve);
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
    .property('isPromise', isPromise);
