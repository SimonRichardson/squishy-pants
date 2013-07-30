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
//        0).foreach(
//            function (a) {
//                console.log(a);
//            }
//        );
//

function Stream(f) {
    var self = getInstance(this, Stream);

    var resolvers = [];
    self.fork = function(resolve) {
        resolvers.push(resolve);
    };

    f(function(a) {
        var total,
            i;

        for (i = 0, total = resolvers.length; i < total; i++) {
            resolvers[i](a);
        }
    });

    return self;
}

Stream.create = function(a, b) {
    var unbinder,
        bounce;

    return new Stream(function(state) {
        unbinder = a(function() {
            bounce = b.apply(null, [].slice.call(arguments));
            if (!bounce.isDone) {
                state(bounce.thunk());
            } else {
                state(bounce.result);
                unbinder();
            }
        });
    });
};

Stream.prototype.chain = function(f) {
    var env = this;
    return new Stream(function(state) {
        env.foreach(function(a) {
            f(a).fold(
                function(a) {
                    state(a);
                },
                function(){}
            );
        });
    });
};

Stream.prototype.concat = function(b) {
    return this.chain(function(a) {
        return Option.Some(a.concat(b));
    });
};

Stream.prototype.empty = function() {
    return this.chain(function(a) {
        return Option.Some(squishy.empty(a));
    });
};

Stream.prototype.equal = function(a) {
    return this.zip(a).fold(true, function(v, t) {
        return v && squishy.equal(t._1, t._2);
    });
};

Stream.prototype.foreach = function(f) {
    var env = this;
    return new Stream(function(state) {
        env.fork(
            function(data) {
                f(data);
                state(data);
            }
        );
    });
};

Stream.prototype.filter = function(f) {
    return this.chain(function(a) {
        return f(a) ? Option.Some(a) : Option.None;
    });
};

Stream.prototype.filterNot = function(f) {
    return this.chain(function(a) {
        return !f(a) ? Option.Some(a) : Option.None;
    });
};

Stream.prototype.flatten = function() {
    return this.flatMap(function (x) {
        return Stream.sequential(squishy.toArray(x));
    });
};

Stream.prototype.flatMap = function(f) {
    var env = this;
    return new Stream(function(state) {
        env.foreach(function(a) {
            f(a).foreach(function(a) {
                state(a);
            });
        });
    });
};

Stream.prototype.fold = function(v, f) {
    return this.chain(function(b) {
        v = f(v, b);
        return Option.Some(v);
    });
};

Stream.prototype.map = function(f) {
    return this.chain(function(a) {
        return Option.Some(f(a));
    });
};

Stream.prototype.merge = function(s) {
    var env = this;

    var resolver,
        stream = new Stream(function(state) {
            resolver = state;
        });

    this.foreach(resolver);
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

Stream.prototype.skip = function(n) {
    var i = 0;
    return this.chain(function(b) {
        return ((++i % n) === 0) ?
                  Option.Some(b) :
                  Option.None;
    });
};

Stream.prototype.window = function(n) {
    var accum = [];
    return this.chain(function(b) {
        accum.push(b);
        accum.splice(-n);
        return Option.Some(accum);
    });
};

Stream.prototype.zip = function(s) {
    var env = this;

    var resolver,
        left = [],
        right = [],
        stream = new Stream(function(state) {
            resolver = state;
        });

    this.foreach(function(a) {
        if (right.length)
            resolver(Tuple2(a, right.shift()));
        else left.push(a);
    });
    s.foreach(function(a) {
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
//
//  ## promise
//
//      Stream.promise(promise).foreach(function (a) {
//        console.log(a);
//      });
//
Stream.promise = function(p) {
    return new Stream(function(state) {
        setTimeout(function() {
            p.fork(
                function(data) {
                    state(Attempt.Success(data));
                },
                function(error) {
                    state(Attempt.Failure(error));
                }
            );
        }, 0);
    });
};

//
//  ## constant
//
//      Stream.constant(squishy.method('arb', Number)).foreach(function (a) {
//        console.log(a);
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
//  ## repeatedly
//
//      Stream.repeatedly(
//          function() {
//              return squishy.method('arb', Number);
//          }
//      ).foreach(function (a) {
//        console.log(a);
//      });
//
Stream.repeatedly = function(f, d) {
    return Stream.poll(function() {
        return cont(f);
    }, d || 0);
};


//
//  ## sequential
//
//      Stream.sequential([1, 2, 3, 4]).foreach(function (a) {
//        console.log(a);
//      });
//
Stream.sequential = function(v, d) {
    var index = 0;
    return Stream.poll(function() {
        if (index >= v.length - 1) {
            return done(v[index]);
        }
        return cont(function() {
            return v[index++];
        });
    }, d || 0);
};

//
//  ## poll
//
//      Stream.poll(function() {
//        return cont(function() {
//            return squishy.method('arb', Number);
//        })
//      }, 0).foreach(function (a) {
//        console.log(a);
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
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Stream', Stream)
    .property('isStream', isStream)
    .method('arb', strictEquals(Stream), function(a, b) {
        var args = this.arb(this.arrayOf(AnyVal), b);
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
