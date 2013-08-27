(function(global) {

    'use strict';

    //
    //   ### Description
    //
    //   squishy-pants.js is a semi-serious functional programming library.
    //
    //   ### Usage
    //
    //   node.js:
    //
    //       var squishy = require('squishy-pants');
    //
    //   Browser:
    //
    //       <script src="squishy-pants.min.js"></script>
    //
    //   ### Development
    //
    //   Download the code with git:
    //
    //       git clone https://github.com/SimonRichardson/squishy-pants.git
    //
    //   Install the development dependencies with npm:
    //
    //       npm install
    //
    //   Run the tests with grunt:
    //
    //       npm test
    //

    /* squishy pant's environment means `this` is special */
    /*jshint validthis: true*/

    /* squishy pants uses the !(this instanceof c) trick to remove `new` */
    /*jshint newcap: false*/

    var squishy;

    //= ../../src/environment.js

    squishy = environment();
    squishy = squishy.property('environment', environment);

    //= ../../src/squishy.js

    //= ../../src/partial.js

    //= ../../src/isa.js

    //= ../../src/check.js

    //= ../../src/builtins.js

    //= ../../src/tagged.js

    //= ../../src/array.js

    //= ../../src/attempt.js

    //= ../../src/either.js

    //= ../../src/option.js

    //= ../../src/tuples.js

    //= ../../src/promise.js

    //= ../../src/trampoline.js

    //= ../../src/stream.js

    //= ../../src/identity.js

    //= ../../src/io.js

    //= ../../src/lens.js

    //= ../../src/store.js

    //= ../../src/reader.js

    //= ../../src/state.js

    //= ../../src/list.js

    /* This is a very greedy method so needs to be employed last */
    squishy = squishy.method('equal', isObject, function(a, b) {
        var i;
        /* We need to be sure that the there is an `a` and a `b` here. */
        if (and(a, b) && isObject(b)) {
            /* This would be better if we turn objects into ordered
               arrays so we can pass it through equal(a, b) */
            for (i in a) {
                if (!squishy.equal(a[i], b[i]))
                    return false;
            }
            for (i in b) {
                if (!squishy.equal(b[i], a[i]))
                    return false;
            }
            return true;
        }
        return false;
    });

    if (typeof exports != 'undefined') {
        /*jshint node: true*/
        exports = module.exports = squishy;
    } else {
        global.squishy = squishy;
    }
})(this);