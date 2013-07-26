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

    var resolver;
    self.fork = function(resolve) {
        resolver = resolve;
    };

    f(function(a) {
        if (resolver) resolver(a);
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

Stream.prototype.foreach = function(f) {
    var env = this;
    return new Stream(function(state) {
        env.fork(
            function(data) {
                f(data);
                state(data);
            },
            function(error) {}
        );
    });
};

Stream.prototype.filter = function(f) {
    return this.chain(function(a) {
        return f(a) ? Option.Some(a) : Option.None;
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

Stream.prototype.reduce = function(v, f) {
    var a = v;
    return this.chain(function(b) {
        a = f(a, b);
        return Option.Some(a);
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
            resolver([a, right.shift()]);
        else left.push(a);
    });
    s.foreach(function(a) {
        if (left.length)
            resolver([left.shift(), a]);
        else right.push(a);
    });

    return stream;
};

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
    .method('zip', isStream, function(b) {
        return a.zip(b);
    })
    .method('map', isStream, function(a, b) {
        return a.map(b);
    });
