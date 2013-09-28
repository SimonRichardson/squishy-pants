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

    //= ../../src/fo.js

    //= ../../src/transformer.js

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

    //= ../../src/writer.js

    //= ../../src/state.js

    //= ../../src/list.js

    //= ../../src/parser.js

    /* Bellow includes are optional */
    //= ../../src/once.js

    if (typeof exports != 'undefined') {
        /*jshint node: true*/
        exports = module.exports = squishy;
    } else {
        global.squishy = squishy;
    }
})(this);