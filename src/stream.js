//
//  ## Stream(state)
//
//  The Stream type represents a flow of data ever evolving values over time.
//
//  Here is an example of a continuous random numbers piped through to the console.
//
//        Stream.poll(
//            function() {
//                return cont(function() {
//                    return squishy.method('arb', Number);
//                })
//            },
//        0).map(
//            function (a) {
//                return a + 1;
//            }
//        );
//
var Propagation = taggedSum('Propagation', {
    Propagate: ['value'],
    Negate: []
});

function Stream(pulse) {
    var self = getInstance(this, Stream),
        listeners = [];

    pulse(
        function(value){
            var total = listeners.length,
                i;

            for(i = 0; i < total; i++) {
                listeners[i](value);
            }
        }
    );

    self.fork = function(func) {
        var binder;

        listeners.push(function pulser(value) {
            /* If the function doesn't return Propagation we'll do it for them */
            var prop = func(value) || Propagation.Propagate(value);
            prop.match({
                Propagate: optional(binder),
                Negate: function() {
                    /* If the result is a negate remove the binder and listeners */
                    binder = null;
                    listeners = squishy.filter(
                        listeners,
                        function(v) {
                            return v !== pulser;
                        }
                    );
                }
            });
        });

        return Stream(function(pulse) {
            binder = pulse;
        });
    };

    return self;
}

Stream.create = function(a, b) {
    var unbinder,
        bounce;

    return Stream(function(pulse) {
        unbinder = a(function() {
            bounce = b.apply(null, [].slice.call(arguments));
            if (!bounce.isDone) {
                pulse(bounce.thunk());
            } else {
                pulse(bounce.result);
                unbinder();
            }
        });
    });
};

Stream.prototype.chain = function(f) {
    var env = this;
    return Stream(function(pulse) {
        env.fork(function(a) {
            f(a).fold(
                pulse,
                nothing
            );
            return Propagation.Negate;
        });
    });
};

Stream.prototype.concat = function(b) {
    return this.chain(function(a) {
        return Option.Some(a.concat(b));
    });
};

Stream.prototype.empty = function(f) {
    return this.fork(function(a) {
        return Propagation.Propagate(squishy.empty(a));
    });
};

Stream.prototype.equal = function(a) {
    return this.zip(a).fold(true, function(v, t) {
        return v && squishy.equal(t._1, t._2);
    });
};

Stream.prototype.foreach = function(f) {
    return this.fork(f);
};

Stream.prototype.filter = function(f) {
    return this.chain(function(a) {
        return f(a) ? Option.Some(a) : Option.None;
    });
};

Stream.prototype.flatMap = function(f) {
    var env = this;
    return Stream(function(state) {
        env.foreach(function(a) {
            f(a).foreach(function(a) {
                state(a);
            });
        });
    });
};

Stream.prototype.fold = function(v, f) {
    return this.chain(function(b) {
        return Option.Some(v = f(v, b));
    });
};

Stream.prototype.map = function(f) {
    return this.fork(function(value) {
        return Propagation.Propagate(f(value));
    });
};

Stream.prototype.merge = function(s) {
    var env = this;

    var resolver,
        stream = Stream(function(pulse) {
            resolver = pulse;
        });

    env.foreach(resolver);
    s.foreach(resolver);

    return stream;
};

Stream.prototype.partition = function(f) {
    return this.chain(function(a) {
        var b = f(a) ? Either.Right(a) : Either.Left(a);
        return Option.some(b);
    });
};

Stream.prototype.reduce = function(f) {
    var a = Option.none;
    return this.chain(function(b) {
        if (a.isEmpty)
            a = Option.some(b);

        a = Option.some(f(a.get(), b));
        return a;
    });
};

Stream.prototype.zip = function(s) {
    var env = this;

    var resolver,
        left = [],
        right = [],
        stream = Stream(function(pulse) {
            resolver = pulse;
        });

    env.fork(function(a) {
        if (right.length)
            resolver(Tuple2(a, right.shift()));
        else left.push(a);
    });
    s.fork(function(a) {
        if (left.length)
            resolver(Tuple2(left.shift(), a));
        else right.push(a);
    });

    return stream;
};

/* Deprecated */
Stream.prototype.toArray = function() {
    var accum = [];
    this.foreach(function(a) {
        accum.push(a);
    });
    return accum;
};

//
//  ## once
//
//      Stream.once(squishy.method('arb', Number)).foreach(function (a) {
//          console.log(a);
//      });
//
Stream.once = function(c, d) {
    return Stream.poll(function() {
        return done(c);
    }, d || 0);
};

//
//  ## constant
//
//      Stream.constant(squishy.method('arb', Number)).foreach(function (a) {
//          console.log(a);
//      });
//
Stream.constant = function(c, d) {
    return Stream.poll(function() {
        return cont(function() {
            return c;
        });
    }, d || 0);
};

//
//  ## sequential
//
//      Stream.sequential([1, 2, 3, 4]).foreach(function (a) {
//          console.log(a);
//      });
//
Stream.sequential = function(v, d) {
    var index = 0;
    return Stream.poll(function() {
        if (index >= v.length - 1) return done(v[index]);
        return cont(function() {
            return v[index++];
        });
    }, d || 0);
};

//
//  ## poll
//
//      Stream.poll(function() {
//          return cont(function() {
//              return squishy.method('arb', Number);
//          })
//      }, 0).foreach(function (a) {
//          console.log(a);
//      });
//
Stream.poll = function(p, d) {
    var id;

    return Stream.create(function(handler) {
        id = setInterval(handler, d);
        return function() {
            return clearInterval(id);
        };
    }, p);
};

//
//  ## isStream(a)
//
//  Returns `true` if `a` is `Stream`.
//
var isStream = isInstanceOf(Stream);

//
//  ## streamOf(type)
//
//  Sentinel value for when an stream of a particular type is needed:
//
//       streamOf(Number)
//
function streamOf(type) {
    var self = getInstance(this, streamOf);
    self.type = type;
    return self;
}

//
//  ## isStreamOf(a)
//
//  Returns `true` if `a` is `streamOf`.
//
var isStreamOf = isInstanceOf(streamOf);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Stream', Stream)
    .property('isStream', isStream)
    .property('streamOf', streamOf)
    .property('isStreamOf', isStreamOf)
    .method('arb', strictEquals(Stream), function(a, b) {
        var args = this.arb(this.arrayOf(AnyVal), b);
        return Stream.sequential(args);
    })
    .method('arb', isStreamOf, function(a, b) {
        var args = this.arb(a.type, b - 1);
        return Stream.sequential(args);
    })
    .method('equal', isStream, function(a, b) {
        return a.equal(b);
    })
    .method('map', isStream, function(a, b) {
        return a.map(b);
    })
    .method('zip', isStream, function(b) {
        return a.zip(b);
    });
