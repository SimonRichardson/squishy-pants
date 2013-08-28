//
//  ## lazy
//
//  Stateful function that guarantees that the function is evaluated
//  only once. Executes a complex function with arguments once, even
//  if called multiple times.
//
//       lazy(
//           function(a) {
//               return Math.sin(a);
//           }, 1
//       )();
//
/* This is really stateful and we should really consider its use. */
/* Use with care */
function lazy(f) {
    /* Create a special lock so we don't have to look for undefined */
    var args = [].slice.call(arguments).slice(1),
        lock = {},
        val = lock;

    return function() {
        if (val === lock) val = f.apply(null, args);
        return val;
    };
}

//
//  ## lazyAsync
//
//  Stateful async function that guarantees that the function is evaluated
//  only once. Executes a complex function with arguments once, even
//  if called multiple times.
//
//       lazyAsync(
//           function(resolve, reject, args) {
//               setTimeout(function() {
//                  resolve(Math.sin(args[0]));
//               }, 100);
//           }, 1
//       )();
//
/* This is really stateful and we should really consider its use. */
/* Use with care */
function lazyAsync(f) {
    var args = [].slice.call(arguments).slice(1),
        resolves = Tuple2([], []),
        applied = function(ctor, f) {

            function stateful(args) {
                captured = ctor(args);
            }

            function invoke(args) {
                var resolvers = f(resolves),
                    index = resolvers.length,
                    func;

                while(--index > -1) {
                    func = resolvers.pop();
                    if (func) func.apply(null, args);
                }

                /* Clear any listeners */
                resolves._1.length = 0;
                resolves._2.length = 0;
            }

            return function() {
                var args = [].slice.call(arguments);

                stateful(args);
                invoke(args);
            };
        },
        deferred = lazy(function() {
            f.apply(null, [
                applied(Either.Left, Tuple2.first),
                applied(Either.Right, Tuple2.second),
                args
            ]);
        }),
        captured;

    return function(a, b) {
        deferred();

        if (captured) {
            var target = captured.match({
                Left: function(v) {
                    return Tuple2(a, v);
                },
                Right: function(v) {
                    return Tuple2(b, v);
                }
            });
            target._1.apply(null, target._2);
        } else {
            resolves._1.push(a);
            resolves._2.push(b);
        }
    };
}


//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('lazy', lazy)
    .property('lazyAsync', lazyAsync);
