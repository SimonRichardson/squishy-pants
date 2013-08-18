//
//  ## Stream(state)
//
//  The Stream type represents a flow of data ever evolving values over time.
//
//  Here is an example of a continuous random numbers piped through to the console.
//
//        Stream.of(1).map(
//            function (a) {
//                return a + 1;
//            }
//        );
//
function Stream(fork) {
    var self = getInstance(this, Stream);
    self.fork = fork;
    return self;
}

Stream.empty = function() {
    return Stream.of();
};

Stream.of = function(a) {
    return Stream(
        function(next, done) {
            squishy.toOption(a).fold(
                next,
                nothing
            );
            return done();
        }
    );
};

Stream.prototype.ap = function(a) {
    return this.chain(
        function(f) {
            return a.map(f);
        }
    );
};

Stream.prototype.chain = function(f) {
    var env = this;
    return Stream(function(next, done) {
        return env.fork(
            function(a) {
                return f(a).fork(next, nothing);
            },
            done
        );
    });
};

Stream.prototype.concat = function(a) {
    var env = this;
    return Stream(function(next, done) {
        return env.fork(
            next,
            function() {
                return a.fork(next, done);
            }
        );
    });
};

Stream.prototype.drop = function(n) {
    var dropped = 0;
    return this.chain(
        function(a) {
            if (dropped < n) {
                dropped++;
                return Stream.empty();
            } else {
                return Stream.of(a);
            }
        }
    );
};

Stream.prototype.equal = function(a) {
    return this.zip(a).fold(
        true,
        function(v, t) {
            return v && squishy.equal(t._1, t._2);
        }
    );
};

Stream.prototype.extract = function() {
    return this.fork(
        identity,
        constant(null)
    );
};

Stream.prototype.filter = function(f) {
    var env = this;
    return Stream(function(next, done) {
        return env.fork(
            function(a) {
                if (f(a)) {
                    next(a);
                }
            },
            done
        );
    });
};

Stream.prototype.fold = function(v, f) {
    var env = this;
    return Stream(
        function(next, done) {
            return env.fork(
                function(a) {
                    v = f(v, a);
                    return v;
                },
                function() {
                    next(v);
                    return done();
                }
            );
        }
    );
};

Stream.prototype.length = function() {
    return this.map(
        constant(1)
    ).fold(
        0,
        curry(function(x, y) {
            return x + y;
        })
    );
};

Stream.prototype.map = function(f) {
    return this.chain(
        function(a) {
            return Stream.of(f(a));
        }
    );
};

Stream.prototype.merge = function(a) {
    var resolver;

    this.map(optional(resolver));
    a.map(optional(resolver));

    return Stream(
        function(next, done) {
            resolver = next;
        }
    );
};

Stream.prototype.scan = function(a, f) {
    var env = this;
    return Stream(
        function(next, done) {
            return env.fork(
                function(b) {
                    a = f(a, b);
                    return next(a);
                },
                done
            );
        });
};

Stream.prototype.take = function(n) {
    var taken = 0;
    return this.chain(
        function(a) {
            return (++taken < n) ? Stream.of(a) : Stream.empty();
        }
    );
};

Stream.prototype.zip = function(a) {
    var env = this;

    return Stream(
        function(next, done) {
            var left = [],
                right = [];

            env.fork(
                function(a) {
                    if (right.length > 0) {
                        next(Tuple2(a, right.shift()));
                    } else {
                        left.push(a);
                    }
                },
                done
            );

            a.fork(
                function(a) {
                    if (left.length > 0) {
                        next(Tuple2(left.shift(), a));
                    } else {
                        right.push(a);
                    }
                },
                done
            );
        }
    );
};

Stream.prototype.zipWithIndex = function() {
    var index = 0;
    return this.map(
        function(a) {
            return Tuple2(a, index++);
        }
    );
};

Stream.fromArray = function(a) {
    return Stream(
        function(next, done) {
            squishy.map(a, next);
            return done();
        }
    );
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
        return Stream.fromArray(args);
    })
    .method('arb', isStreamOf, function(a, b) {
        var args = this.arb(a.type, b - 1);
        return Stream.fromArray(args);
    })
    .method('ap', isStream, function(a, b) {
        return a.ap(b);
    })
    .method('chain', isStream, function(a, b) {
        return a.chain(b);
    })
    .method('concat', isStream, function(a, b) {
        return a.chain(b);
    })
    .method('equal', isStream, function(a, b) {
        return a.equal(b);
    })
    .method('extract', isStream, function(a) {
        return a.extract();
    })
    .method('fold', isStream, function(a, b) {
        return a.chain(b);
    })
    .method('map', isStream, function(a, b) {
        return a.map(b);
    })
    .method('zip', isStream, function(b) {
        return a.zip(b);
    });
