/**
    # Tuples

    Tuples are another way of storing multiple values in a single value.
    They have a fixed number of elements (immutable), and so you can't
    cons to a tuple.
    Elements of a tuple do not need to be all of the same type

    Example usage:

         squishy.Tuple2(1, 2);
         squishy.Tuple3(1, 2, 3);
         squishy.Tuple4(1, 2, 3, 4);
         squishy.Tuple5(1, 2, 3, 4, 5);

**/
var Tuple2 = tagged('Tuple2', ['_1', '_2']),
    Tuple3 = tagged('Tuple3', ['_1', '_2', '_3']),
    Tuple4 = tagged('Tuple4', ['_1', '_2', '_3', '_4']),
    Tuple5 = tagged('Tuple5', ['_1', '_2', '_3', '_4', '_5']);

/**
   ## isTuple2(a)

   Returns `true` if `a` is `Tuple2`.
**/
var isTuple2 = isInstanceOf(Tuple2);

/**
   ## isTuple4(a)

   Returns `true` if `a` is `Tuple3`.
**/
var isTuple3 = isInstanceOf(Tuple3);

/**
   ## isTuple4(a)

   Returns `true` if `a` is `Tuple4`.
**/
var isTuple4 = isInstanceOf(Tuple4);

/**
   ## isTuple5(a)

   Returns `true` if `a` is `Tuple5`.
**/
var isTuple5 = isInstanceOf(Tuple5);

squishy = squishy
    .property('Tuple2', Tuple2)
    .property('Tuple3', Tuple3)
    .property('Tuple4', Tuple4)
    .property('Tuple5', Tuple5)
    .property('isTuple2', isTuple2)
    .property('isTuple3', isTuple3)
    .property('isTuple4', isTuple4)
    .property('isTuple5', isTuple5);