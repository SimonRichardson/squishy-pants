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
//  * tries - number of times inputs were tested before failure
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
//  `Boolean`. Tries `goal` number of times or until failure.
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
            return Option.some(failureReporter(
                findSmallest(this, property, inputs),
                i + 1
            ));
        }
    }

    return Option.none;
}

//
//  ## goal
//
//  The number of successful inputs necessary to declare the whole
//  property a success:
//
//       var _ = squishy.property('goal', 1000);
//
//  Default is `100`.
//
var goal = 100;

squishy = squishy
    .property('failureReporter', failureReporter)
    .property('forAll', forAll)
    .property('goal', goal);
