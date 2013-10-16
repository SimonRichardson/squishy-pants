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
//   ## Tuple2
//
//   * `flip()` - flip values
//   * `concat()` - Semigroup (value must also be a Semigroup)
//   * `equal(a)` -  `true` if `a` is equal to `this`
//   * `chain(f)` - Monadic flatMap/bind
//   * `toArray()` - `[_1, _2]` of the tuple
//

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple2`.
//
Tuple2.of = function(a, b) {
    return Tuple2(a, b);
};

//
//   ### flip()
//
//   Flip the values of the first and second.
//
Tuple2.prototype.flip = function() {
    return Tuple2.of(this._2, this._1);
};

//
//  ### concat(s, f)
//
//  Concatenate two tuples associatively together.
//  Semigroup concat
//
Tuple2.prototype.concat = function(b) {
    return Tuple2.of(
        squishy.concat(this._1, b._1),
        squishy.concat(this._2, b._2)
    );
};

//
//  ### equal(a)
//
//  Compare two option values for equality
//
Tuple2.prototype.equal = function(b) {
    return squishy.equal(this.toArray(), b.toArray());
};

//
//  ### chain(f)
//
//  Bind through the tuple of the tuples
//  Monadic flatMap/bind
//
Tuple2.prototype.chain = function(f) {
    return f(this);
};

//
//   ## Tuple3
//
//   * `concat()` - Semigroup (value must also be a Semigroup)
//   * `equal(a)` -  `true` if `a` is equal to `this`
//   * `chain(f)` - Monadic flatMap/bind
//   * `toArray()` - `[_1, _2, _3]` of the tuple
//

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple3`.
//
Tuple3.of = function(a, b, c) {
    return Tuple3(a, b, c);
};

//
//  ### concat(s, f)
//
//  Concatenate two tuples associatively together.
//  Semigroup concat
//
Tuple3.prototype.concat = function(b) {
    return Tuple3.of(
        squishy.concat(this._1, b._1),
        squishy.concat(this._2, b._2),
        squishy.concat(this._3, b._3)
    );
};

//
//  ### equal(a)
//
//  Compare two option values for equality
//
Tuple3.prototype.equal = function(b) {
    return squishy.equal(this.toArray(), b.toArray());
};

//
//  ### chain(f)
//
//  Bind through the tuple of the tuples
//  Monadic flatMap/bind
//
Tuple3.prototype.chain = function(f) {
    return f(this);
};

//
//   ## Tuple4
//
//   * `concat()` - Semigroup (value must also be a Semigroup)
//   * `equal(a)` -  `true` if `a` is equal to `this`
//   * `chain(f)` - Monadic flatMap/bind
//   * `toArray()` - `[_1, _2, _3, _4]` of the tuple
//

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple4`.
//
Tuple4.of = function(a, b, c, d) {
    return Tuple4(a, b, c, d);
};

//
//  ### concat(s, f)
//
//  Concatenate two tuples associatively together.
//  Semigroup concat
//
Tuple4.prototype.concat = function(b) {
    return Tuple4.of(
        squishy.concat(this._1, b._1),
        squishy.concat(this._2, b._2),
        squishy.concat(this._3, b._3),
        squishy.concat(this._4, b._4)
    );
};

//
//  ### equal(a)
//
//  Compare two option values for equality
//
Tuple4.prototype.equal = function(b) {
    return squishy.equal(this.toArray(), b.toArray());
};

//
//  ### chain(f)
//
//  Bind through the tuple of the tuples
//  Monadic flatMap/bind
//
Tuple4.prototype.chain = function(f) {
    return f(this);
};

//
//   ## Tuple5
//
//   * `concat()` - Semigroup (value must also be a Semigroup)
//   * `equal(a)` -  `true` if `a` is equal to `this`
//   * `chain(f)` - Monadic flatMap/bind
//   * `toArray()` - `[_1, _2, _3, _4, _5]` of the tuple
//

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Tuple5`.
//
Tuple5.of = function(a, b, c, d, e) {
    return Tuple5(a, b, c, d, e);
};

//
//  ### concat(s, f)
//
//  Concatenate two tuples associatively together.
//  Semigroup concat
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

//
//  ### equal(a)
//
//  Compare two option values for equality
//
Tuple5.prototype.equal = function(b) {
    return squishy.equal(this.toArray(), b.toArray());
};

//
//  ### chain(f)
//
//  Bind through the tuple of the tuples
//  Monadic flatMap/bind
//
Tuple5.prototype.chain = function(f) {
    return f(this);
};

//
//  ## isTuple2(a)
//
//  Returns `true` if `a` is `Tuple2`.
//
var isTuple2 = isInstanceOf(Tuple2);

//
//  ## isTuple4(a)
//
//  Returns `true` if `a` is `Tuple3`.
//
var isTuple3 = isInstanceOf(Tuple3);

//
//  ## isTuple4(a)
//
//  Returns `true` if `a` is `Tuple4`.
//
var isTuple4 = isInstanceOf(Tuple4);

//
//  ## isTuple5(a)
//
//  Returns `true` if `a` is `Tuple5`.
//
var isTuple5 = isInstanceOf(Tuple5);

//
//  ## isTuple(a)
//
//  Returns `true` if `a` is `Tuple`.
//
var isTuple = function(a) {
    return  isTuple2(a) ||
            isTuple3(a) ||
            isTuple4(a) ||
            isTuple5(a);
};

//
//  ## arbTuple(a)
//
//  Returns an arbitrary `Tuple` with the right set of values.
//
var arbTuple = curry(function(t, n) {
    return function(a, s) {
        var env = this;
        return t.of.apply(this, env.map(
            env.fill(n)(function(i) {
                return a.types[i];
            }),
            function(arg) {
                return env.arb(arg, s);
            }
        ));
    };
});

//
//  ## tuple2Of(a, b)
//
//  Sentinel value for when an tuple2 of a particular type is needed:
//
//       tuple2Of(Number, Number)
//
function tuple2Of(a, b) {
    var self = getInstance(this, tuple2Of);
    self.types = rest(arguments);
    return self;
}

//
//  ## isTuple2Of(a)
//
//  Returns `true` if `a` is an instance of `tuple2Of`.
//
var isTuple2Of = isInstanceOf(tuple2Of);

//
//  ## tuple3Of(a, b, c)
//
//  Sentinel value for when an tuple3 of a particular type is needed:
//
//       tuple3Of(Number, Number, Number)
//
function tuple3Of(a, b, c) {
    var self = getInstance(this, tuple3Of);
    self.types = rest(arguments);
    return self;
}

//
//  ## isTuple3Of(a)
//
//  Returns `true` if `a` is an instance of `tuple3Of`.
//
var isTuple3Of = isInstanceOf(tuple3Of);

//
//  ## tuple4Of(a, b, c, d)
//
//  Sentinel value for when an tuple4 of a particular type is needed:
//
//       tuple4Of(Number, Number, Number, Number)
//
function tuple4Of(a, b, c, d) {
    var self = getInstance(this, tuple4Of);
    self.types = rest(arguments);
    return self;
}

//
//  ## isTuple4Of(a)
//
//  Returns `true` if `a` is an instance of `tuple4Of`.
//
var isTuple4Of = isInstanceOf(tuple4Of);

//
//  ## tuple5Of(a, b, c, d, e)
//
//  Sentinel value for when an tuple5 of a particular type is needed:
//
//       tuple5Of(Number, Number, Number, Number, Number)
//
function tuple5Of(a, b, c, d, e) {
    var self = getInstance(this, tuple5Of);
    self.types = rest(arguments);
    return self;
}

//
//  ## isTuple5Of(a)
//
//  Returns `true` if `a` is an instance of `tuple5Of`.
//
var isTuple5Of = isInstanceOf(tuple5Of);

//
//  ### lens
//
//  Lens access for a object at a given property.
//
var lens = curry(function(ctor, index) {
    return Lens(function(a) {
        return Store(
            function(s) {
                var m = a.toArray();
                m[index] = s;
                return ctor.of.apply(null, m);
            },
            function() {
                return a.toArray()[index];
            }
        );
    });
});

//
//  ### lens
//
//  Lens access for a object at a given property.
//
Tuple2.lens = lens(Tuple2);

//
//  ### lens
//
//  Lens access for a object at a given property.
//
Tuple3.lens = lens(Tuple3);

//
//  ### lens
//
//  Lens access for a object at a given property.
//
Tuple4.lens = lens(Tuple4);

//
//  ### lens
//
//  Lens access for a object at a given property.
//
Tuple5.lens = lens(Tuple5);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Tuple2', Tuple2)
    .property('Tuple3', Tuple3)
    .property('Tuple4', Tuple4)
    .property('Tuple5', Tuple5)
    .property('tuple2Of', tuple2Of)
    .property('tuple3Of', tuple3Of)
    .property('tuple4Of', tuple4Of)
    .property('tuple5Of', tuple5Of)
    .property('isTuple2', isTuple2)
    .property('isTuple3', isTuple3)
    .property('isTuple4', isTuple4)
    .property('isTuple5', isTuple5)
    .property('isTuple2Of', isTuple2Of)
    .property('isTuple3Of', isTuple3Of)
    .property('isTuple4Of', isTuple4Of)
    .property('isTuple5Of', isTuple5Of)
    .method('arb', isTuple2Of, arbTuple(Tuple2, 2))
    .method('arb', isTuple3Of, arbTuple(Tuple3, 3))
    .method('arb', isTuple4Of, arbTuple(Tuple4, 4))
    .method('arb', isTuple5Of, arbTuple(Tuple5, 5))
    .method('shrink', isTuple, function(a, b) {
        return [];
    })
    .method('concat', isTuple, function(a, b) {
        return a.concat(b);
    })
    .method('equal', isTuple, function(a, b) {
        return a.equal(b);
    })
    .method('chain', isTuple, function(a, b) {
        return a.chain(b);
    })
    .method('toArray', isTuple, function(a, b) {
        return a.toArray();
    });
