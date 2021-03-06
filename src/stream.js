//
//  ## Stream(fork)
//
//  The Stream type represents a flow of data ever evolving values over time.
//
//  Here is an example of a number piped through to the console.
//
//        Stream.of(1).map(
//            function (a) {
//                return a + 1;
//            }
//        ).fork(console.log);
//
//
//   * `ap(a, b)` - Applicative ap(ply)
//   * `concat(a, b)` - Appends two stream objects.
//   * `drop(a, n)` - Returns the stream without its n first elements. If this stream has less than n elements, the empty stream is returned.
//   * `filter(a, f)` - Returns all the elements of this stream that satisfy the predicate p.
//   * `chain(a, f)` - Applies the given function f to each element of this stream, then concatenates the results.
//   * `fold(a, v, f)` - Combines the elements of this stream together using the binary function f, from Left to Right, and starting with the value v.
//   * `map(a, f)` - Returns the stream resulting from applying the given function f to each element of this stream.
//   * `scan(a, f)` - Combines the elements of this stream together using the binary operator op, from Left to Right
//   * `take(n)` - Returns the n first elements of this stream.
//   * `zip(a, b)` - Returns a stream formed from this stream and the specified stream that by associating each element of the former with the element at the same position in the latter.
//   * `zipWithIndex(a)` -  Returns a stream form from this stream and a index of the value that is associated with each element index position.
//
var Stream = tagged('Stream', ['fork']);

//
//  ### of(x)
//
//  Creates a stream that contains a successful value.
//
Stream.of = function(a) {
    return Stream(
        function(next, done) {
            if (!isNull(a)) next(a);
            return done(a);
        }
    );
};

//
//  ### empty()
//
//  Creates a Empty stream that contains no value.
//
Stream.empty = function() {
    return Stream(
        function(next, done) {
            return done(null);
        }
    );
};

//
//  ### ap(b)
//
//  Apply a function in the environment of the success of this stream
//  Applicative ap(ply)
//
Stream.prototype.ap = function(a) {
    return this.chain(
        function(f) {
            return a.map(f);
        }
    );
};

//
//  ### both(a)
//
//  returns a stream formed from this stream and the specified stream that
//  by associating each element to the current element.
//
Stream.prototype.both = function(a, t) {
    var env = this,
        x = Tuple2.lens(0),
        y = Tuple2.lens(1);

    return Stream(
        function(next, done) {
            var end = once(function() {
                    return once(done);
                });

            env.fork(
                function(v) {
                    t = x.run(t).set(v);
                    next(t);
                },
                end
            );

            a.fork(
                function(v) {
                    t = y.run(t).set(v);
                    next(t);
                },
                end
            );
        }
    );
};

//
//  ### chain(f)
//
//  Returns a new stream that evaluates `f` when the current stream
//  is successfully fulfilled. `f` must return a new stream.
//
Stream.prototype.chain = function(f) {
    var env = this,
        latest;
    return Stream(function(next, done) {
        return env.fork(
            function(a) {
                return f(a).fork(
                    next,
                    function(x) {
                        latest = x;
                        return x;
                    }
                );
            },
            function(x) {
                return done(isUndefined(latest) ? x : latest);
            }
        );
    });
};

//
//  ### concat(s, f)
//
//  Concatenate two streams associatively together.
//  Semigroup concat
//
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

//
//  ### drop(f)
//
//  Returns the stream without its n first elements.
//
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

//
//  ### equal(a)
//
//  Compare two stream values for equality
//
Stream.prototype.equal = function(a) {
    return this.zip(a).fold(
        true,
        function(v, t) {
            return v && squishy.equal(t._1, t._2);
        }
    );
};

//
//  ### extract(a)
//
//  Extract the value from the stream.
//
Stream.prototype.extract = function() {
    return this.fork(
        identity,
        identity
    );
};

//
//  ### filter(f)
//
//  Returns all the elements of this stream that satisfy the predicate p.
//
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

//
//  ### fold(v, f)
//
//  Combines the elements of this stream together using the binary function f
//
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
                    return done(v);
                }
            );
        }
    );
};

//
//  ### length()
//
//  Returns the length of the stream
//
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

//
//  ### map(f)
//
//  Returns the stream resulting from applying the given function f to each
//  element of this stream.
//
Stream.prototype.map = function(f) {
    return this.chain(
        function(a) {
            return Stream.of(f(a));
        }
    );
};

//
//  ### merge(a)
//
//  Merge the values of two streams in to one stream
//
Stream.prototype.merge = function(a) {
    var env = this;

    return Stream(
        function(next, done) {
            var end = once(done);

            env.fork(next, end);
            a.fork(next, end);
        }
    );
};

//
//  ### pipe(a)
//
//  Pipe a stream to a state or writer monad.
//
Stream.prototype.pipe = function(o) {
    var env = this;
    return Stream(
        function(next, done) {
            return env.fork(
                function(v) {
                    return o.run(v);
                },
                done
            );
        }
    );
};

//
//  ### scan(a)
//
//  Combines the elements of this stream together using the binary operator
//  op, from Left to Right
//
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

//
//  ### take(v, f)
//
//  Returns the n first elements of this stream.
//
Stream.prototype.take = function(n) {
    var taken = 0;
    return this.chain(
        function(a) {
            return (++taken < n) ? Stream.of(a) : Stream.empty();
        }
    );
};

//
//  ### zip(b)
//
//  Returns a stream formed from this stream and the specified stream that
//  by associating each element of the former with the element at the same
//  position in the latter.
//
Stream.prototype.zip = function(a) {
    var env = this;

    return Stream(
        function(next, done) {
            var left = [],
                right = [],
                end = once(done);

            env.fork(
                function(a) {
                    if (right.length > 0) {
                        next(Tuple2(a, right.shift()));
                    } else {
                        left.push(a);
                    }
                },
                end
            );

            a.fork(
                function(a) {
                    if (left.length > 0) {
                        next(Tuple2(left.shift(), a));
                    } else {
                        right.push(a);
                    }
                },
                end
            );
        }
    );
};

//
//  ### zipWithIndex()
//
//  Returns a stream form from this stream and a index of the value that
//  is associated with each element index position.
//
Stream.prototype.zipWithIndex = function() {
    var index = 0;
    return this.map(
        function(a) {
            return Tuple2(a, index++);
        }
    );
};

//
//  ## toPromise()
//
//  Returns a promise with all the values sent in a stream.
//
Stream.prototype.toPromise = function() {
    var env = this;
    return Promise(function(resolve) {
        var accum = [];
        return env.fork(
            function(x) {
                accum.push(x);
            },
            function() {
                return resolve(accum);
            }
        );
    });
};

//
//  ## fromArray(a)
//
//  Returns a new stream which iterates over each element of the array.
//
Stream.fromArray = function(a) {
    if (a.length < 1) {
        return Stream(function(next, done) {
            return done([]);
        });
    }

    return Stream(
        function(next, done) {
            squishy.map(a, next);
            return done(a);
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
//  ## Stream Transformer
//
//  The trivial monad transformer, which maps a monad to an equivalent monad.
//
//  * `chain(f)` - chain values
//  * `map(f)` - functor map
//

var StreamT = tagged('StreamT', ['run']);

Stream.StreamT = transformer(StreamT);

//
//  ### fork(a, b)
//
//  Open up fork from the reader transformer
//
StreamT.prototype.fork = function(a, b) {
    return this.run.fork(a, b);
};

//
//  ## isStreamT(a)
//
//  Returns `true` if `a` is `StreamT`.
//
var isStreamT = isInstanceOf(StreamT);

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
//  ## streamTOf(type)
//
//  Sentinel value for when an stream of a particular type is needed:
//
//       streamTOf(Number)
//
function streamTOf(type) {
    var self = getInstance(this, streamTOf);
    self.type = type;
    return self;
}

//
//  ## isStreamTOf(a)
//
//  Returns `true` if `a` is an instance of `streamTOf`.
//
var isStreamTOf = isInstanceOf(streamTOf);

//
//  ### Fantasy Overload
//
fo.unsafeSetValueOf(Stream.prototype);

//
//  ### lens
//
//  Lens access for an reader structure.
//
Stream.lens = function() {
    return Lens(function(a) {
        return Store(
            function(s) {
                return Stream(s);
            },
            function() {
                return a.fork;
            }
        );
    });
};

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Stream', Stream)
    .property('StreamT', StreamT)
    .property('streamOf', streamOf)
    .property('streamTOf', streamTOf)
    .property('isStream', isStream)
    .property('isStreamT', isStreamT)
    .property('isStreamOf', isStreamOf)
    .property('isStreamTOf', isStreamTOf)
    .method('of', strictEquals(Stream), function(x, y) {
        return Stream.of(y);
    })
    .method('empty', strictEquals(Stream), function() {
        return Stream.empty();
    })

    .method('arb', isStreamOf, function(a, b) {
        var args = this.arb(a.type, b - 1);
        return Stream.fromArray(args);
    })
    .method('arb', isStreamTOf, function(a, b) {
        return Stream.StreamT(this.arb(streamOf(a.type), b - 1));
    })

    .method('concat', isStream, function(a, b) {
        return a.concat(b);
    })
    .method('extract', isStream, function(a) {
        return a.extract();
    })
    .method('fold', isStream, function(a, b, c) {
        return a.fold(b, c);
    })
    .method('zip', isStream, function(a, b) {
        return a.zip(b);
    })

    .method('ap', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
        return a.ap(b);
    })
    .method('chain', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
        return a.chain(b);
    })
    .method('equal', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
        return a.equal(b);
    })
    .method('map', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
        return a.map(b);
    })
    .method('shrink', squishy.liftA2(or, isStream, isStreamT), function(a, b) {
        return [];
    });
