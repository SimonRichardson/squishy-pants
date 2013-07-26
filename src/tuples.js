//
//  # Tuples
//
//  Tuples are another way of storing multiple values in a single value.
//  They have a fixed number of elements (immutable), and so you can't
//  cons to a tuple.
//  Elements of a tuple do not need to be all of the same type
//
//  Example usage:
//
//       squishy.Tuple2(1, 2);
//       squishy.Tuple3(1, 2, 3);
//       squishy.Tuple4(1, 2, 3, 4);
//       squishy.Tuple5(1, 2, 3, 4, 5);
//
var Tuple2 = tagged('Tuple2', ['_1', '_2']),
    Tuple3 = tagged('Tuple3', ['_1', '_2', '_3']),
    Tuple4 = tagged('Tuple4', ['_1', '_2', '_3', '_4']),
    Tuple5 = tagged('Tuple5', ['_1', '_2', '_3', '_4', '_5']);

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple2`.
//
Tuple2.of = function(a, b) {
    return Tuple2(a, b);
};

//
//  ## Tuple2
//
//  * flip() - flip values
//  * concat() - Semigroup (value must also be a Semigroup)
//
Tuple2.prototype.flip = function() {
    return Tuple2.of(this._2, this._1);
};

Tuple2.prototype.concat = function(b) {
    return Tuple2.of(
        squishy.concat(this._1, b._1),
        squishy.concat(this._2, b._2)
    );
};

Tuple2.prototype.toArray = function() {
    return [this._1, this._2];
};

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple3`.
//
Tuple3.of = function(a, b, c) {
    return Tuple3(a, b, c);
};

//
//  ## Tuple3
//
//  * concat() - Semigroup (value must also be a Semigroup)
//
Tuple3.prototype.concat = function(b) {
    return Tuple3.of(
        squishy.concat(this._1, b._1),
        squishy.concat(this._2, b._2),
        squishy.concat(this._3, b._3)
    );
};

Tuple3.prototype.toArray = function() {
    return [this._1, this._2, this._3];
};

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple4`.
//
Tuple4.of = function(a, b, c, d) {
    return Tuple4(a, b, c, d);
};

//
//  ## Tuple4
//
//  * concat() - Semigroup (value must also be a Semigroup)
//
Tuple4.prototype.concat = function(b) {
    return Tuple4.of(
        squishy.concat(this._1, b._1),
        squishy.concat(this._2, b._2),
        squishy.concat(this._3, b._3),
        squishy.concat(this._4, b._4)
    );
};

Tuple4.prototype.toArray = function() {
    return [this._1, this._2, this._3, this._4];
};

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple5`.
//
Tuple5.of = function(a, b, c, d, e) {
    return Tuple5(a, b, c, d, e);
};

//
//  ## Tuple5
//
//  * concat() - Semigroup (value must also be a Semigroup)
//
Tuple5.prototype.concat = function(b) {
    return Tuple5.of(
        squishy.concat(this._1, b._1),
        squishy.concat(this._2, b._2),
        squishy.concat(this._3, b._3),
        squishy.concat(this._4, b._4),
        squishy.concat(this._5, b._5)
    );
};

Tuple5.prototype.toArray = function() {
    return [this._1, this._2, this._3, this._4, this._5];
};

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