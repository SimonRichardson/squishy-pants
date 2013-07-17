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

var Attempt = taggedSum({
    success: ['value'],
    failure: ['errors']
});

//
//  ## success(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.success.prototype.isSuccess = true;
Attempt.success.prototype.isFailure = false;

//
//  ## failure(x)
//
//  Constructor to represent the existance of a value, `x`.
//
Attempt.failure.prototype.isSuccess = false;
Attempt.failure.prototype.isFailure = true;

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
    .property('isAttempt', isAttempt);
