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
var goal = 10;//00;

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
            if (x) accum.push(a.slice(0, a.length - x));
        }

        return accum;
    })
    .method('shrink', isBoolean, function(b) {
        return b ? [false] : [true];
    })
    .method('shrink', isNumber, function(n) {
        var accum = [0],
            x = n;

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
