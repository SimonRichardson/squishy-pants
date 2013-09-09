//
//    # Fo (Fantasy Overloading)
//
//    Overloaded operators for compatible JavaScript:
//
//      * `>=` Monad chain:
//
//            fo()(
//                Option.Some(1) >= function(x) {
//                    return x < 0 ? Option.None : Option.Some(x + 2);
//                }
//            ).getOrElse(0) == 3;
//
//      * `<` Monad sequence:
//
//            fo()(
//                Option.Some(1) < Option.Some(2)
//            ).getOrElse(0) == 2;
//
//      * `%` Functor map:
//
//            fo()(
//                Option.Some(1) % add(2)
//            ).getOrElse(0) == 3;
//
//      * `*` Applicative ap(ply):
//
//            fo()(
//                Option.Some(add) * Option.Some(1) * Option.Some(2)
//            ).getOrElse(0) == 3;
//
//      * `<<` Compose:
//
//            fo()(
//                add(1) << times(2)
//            )(3) == 7;
//
//      * `>>` Compose reverse:
//
//            fo()(
//                add(1) >> times(2)
//            )(3) == 8;
//
//      * `+` Semigroup concat:
//
//            fo()(
//                Option.Some([1, 2]) + Option.Some([3, 4])
//            ).getOrElse([]) == [1, 2, 3, 4];
//
//      * `-` Group minus:
//
//            fo()(
//                Option.Some(1) - Option.Some(2)
//            ).getOrElse(0) == -1;
//

/* Gross mutable global */
var foQueue;

//
//    ## fo()(a)
//
//    Creates a new syntax scope. The `a` expression is allowed multiple
//    usages of a single operator per `fo` call.
//
//    For most operations, the associated name will be called on the
//    operands. for example:
//
//        fo()(Option.Some([1, 2]) + Option.Some([3, 4]))
//
//    De-sugars into:
//
//        Option.Some([1, 2]).concat(Option.Some([3, 4]))
//
//    The exceptions are `andThen`, `sequence` and `minus`. They are
//    derived from Compose, Monad and Group, respectively.
//
function fo() {
    var env = squishy,
        prevFoQueue = foQueue;

    if(arguments.length) {
        env.error('Expecting no arguments given to fo. Use fo()(arguments)')();
    }

    foQueue = [];

    //
    //  ## proxy(prop)(a)(b)
    //
    //  Lazy dynamic composing of structures / containers together via a property.
    //
    var proxy = curry(function(prop, a, b) {
        return env[prop](a, b);
    });

    return function(n) {
        var op,
            x;

        if(!foQueue.length) {
            foQueue = prevFoQueue;
            return n;
        }

        // >= > === ==
        if(n === false) {
            op = proxy('chain');

        // >> >>> &
        } else if(n === 0) {
            op = andThen;

        // <<
        } else if(n === Math.pow(2, (2 << foQueue.length) - 3)) {
            op = proxy('compose');

        // *
        } else if(n === Math.pow(2, foQueue.length * (foQueue.length + 1) / 2)) {
            op = proxy('ap');

        // + | ^
        } else if(n === (2 << foQueue.length) - 2) {
            op = proxy('concat');

        // %
        } else if(n === 2) {
            op = proxy('map');

        // -
        } else if(n < 0) {
            op = minus;

        // < <= !== !=
        } else if(n === true) {
            op = sequence;

        } else {
            foQueue = prevFoQueue;
            env.error("Couldn't determine operation. Has fo.unsafeSetValueOf been called for all operands?")();
        }

        x = env.reduce(foQueue, function(a, b) {
            /* Unbox a overload if it is wrapped in */
            var left = isBox(a) ? a.unbox() : a,
                right = isBox(b) ? b.unbox() : b;

            return op(left).call(left, right);
        });

        foQueue = prevFoQueue;

        return x;
    };
}

//
//   ## fo.unsafeSetValueOf(proto)
//
//   Used to mutate the `valueOf` property on `proto`. Necessary to fo
//   the `fo` block's operator overloading. Uses the object's existing
//   `valueOf` if not in a `fo` block.
//
//   *Warning:* this mutates `proto`. May not be safe, even though it
//   tries to default back to the normal behaviour when not in a `fo`
//   block.
//
fo.unsafeSetValueOf = function(proto) {
    var prev = proto.valueOf;
    proto.valueOf = function() {

        if(foQueue === void(0)) {
            return prev.call(this);
        }

        foQueue.push(this);

        return 1 << foQueue.length;
    };
};

//
//  ## Function wrapper
//
//  This wraps a function so we can extract it later, ideal for for
//  chaining functions (see fo.chain).
//
/*
    This is an alternative for overriding `fo.unsafeSetValueOf(Function.prototype)`,
    which obviously is not what we want to do if the library is interfacing with
    other external sources. So we Box the function so we can later test against it.
*/
var Box = tagged('Box', ['value']);

Box.prototype.unbox = function() {
    return this.value;
};

//
//  ## isBox(a)
//
//  Returns `true` if `a` is an instance of `Box`.
//
var isBox = isInstanceOf(Box);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Box.prototype);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('fo', fo)
    .property('Box', Box);
