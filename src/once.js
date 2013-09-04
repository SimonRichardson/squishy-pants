//
//  ## once
//
//  Stateful function that guarantees that the function is evaluated
//  only once. Executes a complex function with arguments once, even
//  if called multiple times.
//
//       once(
//           function(a) {
//               return Math.sin(a);
//           }, 1
//       )();
//
/* This is really stateful and we should really consider its use. */
/* Use with care */
function once(f) {
    /* Create a special lock so we don't have to look for undefined */
    var args = rest(arguments).slice(1),
        lock = {},
        val = lock;

    return function() {
        if (val === lock) val = f.apply(null, args);
        return val;
    };
}

//
//  ## asyncOnce
//
//  Stateful async function that guarantees that the function is evaluated
//  only once. Executes a complex function with arguments once, even
//  if called multiple times.
//
//       asyncOnce(
//           function(resolve, args) {
//               setTimeout(function() {
//                  resolve(Math.sin(args[0]));
//               }, 100);
//           }, 1
//       )();
//
/* This is really stateful and we should really consider its use. */
/* Use with care */
function asyncOnce(f) {
    var args = rest(arguments).slice(1),
        resolves = [],
        stateful = function(args) {
            captured = args;
        },
        invoke = function(args) {
            var index = resolves.length;

            while(--index > -1) {
                optional(resolves.pop()).apply(null, args);
            }
        },
        deferred = once(function() {
            f.apply(null, [
                function() {
                    var args = rest(arguments);

                    stateful(args);
                    invoke(args);
                },
                args
            ]);
        }),
        captured;

    return function(f) {
        deferred();

        if (captured) f.apply(null, captured);
        else resolves.push(f);
    };
}


//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('once', once)
    .property('asyncOnce', asyncOnce);
