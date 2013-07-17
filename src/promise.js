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
    /* It would be nice to be able to remove the listeners */
    var listeners = [],
        attempt;

    var append = curry(function(a, b) {
        a.push(b);
    })(listeners);

    var dispatch = curry(function(a, b) {
        for (var i = a.length - 1; i > -1; i--) {
            a.pop()(b);
        }
    })(listeners);

    var curriedDeferred = (function(init) {
        return function() {
            if (!init) {
                init = true;
                deferred(function(data) {
                    attempt = data;
                    dispatch(data);
                });
            }
        };
    })(false);

    this.fork = function(resolve) {
        if (attempt) {
            resolve(attempt);
        } else {
            append(resolve);
            curriedDeferred();
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
