//
//  # Attempt
//
//       Attempt e v = Failure e + Success v
//
//  The Attempt data type represents a "success" value or a
//  semigroup of "failure" values. Attempt has an applicative
//  functor which collects failures' errors or creates a new success
//  value.
//
//  Here's an example function which validates a String:
//
//       function nonEmpty(field, string) {
//           return string
//               ? squishy.success(string)
//               : squishy.failure([field + " must be non-empty"]);
//       }
//
//  ## success(value)
//
//  Represents a successful `value`.
//
//  ## failure(errors)
//
//  Represents a failure.
//

var Attempt = taggedSum('Attempt', {
    success: ['value'],
    failure: ['errors']
});

Attempt.success.prototype.map = function(f) {
    return Attempt.success.of(f(this.value));
};

Attempt.success.prototype.ap = function(v) {
    return v.map(this.value);
};

Attempt.failure.prototype.map = function() {
    return this;
};

Attempt.failure.prototype.ap = function(b, concat) {
    var a = this;
    return b.match({
        success: function(value) {
            return a;
        },
        failure: function(errors) {
            return Attempt.failure.of(concat(a.errors, errors));
        }
    });
};

//
//  ## success(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.success.prototype.isSuccess = true;
Attempt.success.prototype.isFailure = false;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Attempt.success` with value of `x`.
//
Attempt.success.of = function(x) {
    return Attempt.success(x);
};

//
//  ## failure(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.failure.prototype.isSuccess = false;
Attempt.failure.prototype.isFailure = true;

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Attempt.failure` with value of `x`.
//
Attempt.failure.of = function(x) {
    return Attempt.failure(x);
};

//
//  ## isAttempt(a)
//
//  Returns `true` iff `a` is a `success` or a `failure`.
//
var isAttempt = isInstanceOf(Attempt);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('success', Attempt.success)
    .property('failure', Attempt.failure)
    .property('isAttempt', isAttempt)
    .method('map', isAttempt, function(v, f) {
        return v.map(f);
    })
    .method('ap', isAttempt, function(vf, v) {
        return vf.ap(v, this.concat);
    });
