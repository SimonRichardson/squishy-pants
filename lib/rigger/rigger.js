(function(global) {

    'use strict';

    /* squishy pant's environment means `this` is special */
    /*jshint validthis: true*/

    /* squishy pants uses the !(this instanceof c) trick to remove `new` */
    /*jshint newcap: false*/

    var squishy;

    //= ../../src/environment.js

    squishy = environment();
    squishy = squishy.property('environment', environment);

    //= ../../src/squishy.js

    //= ../../src/isa.js

    //= ../../src/promise.js

    if (typeof exports != 'undefined') {
        /*jshint node: true*/
        exports = module.exports = squishy;
    } else {
        global.squishy = squishy;
    }
})(this);