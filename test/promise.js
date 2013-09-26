var _ = require('./lib/test'),
    resolveEquality = function(a, b) {
        return a.fork(
            function(x) {
                return b.fork(
                    function(y) {
                        return _.expect(x).toBe(y);
                    },
                    _.constant(false)
                );
            },
            _.constant(false)
        );
    };

exports.promise = {
    'testing promise should return the correct result': _.check(
        function(a) {
            var promise = _.Promise(
                function(resolve, reject) {
                    return resolve(a);
                }
            );
            return promise.fork(
                function(data) {
                    return _.expect(data).toBe(a);
                },
                function(errors) {
                    _.error('Failed if called')();
                }
            );
        },
        [_.AnyVal]
    ),
    'testing promise with multiple forks should return the correct result': _.check(
        function(a) {
            var promise = _.Promise(
                    function(resolve, reject) {
                        return resolve(a);
                    }
                ),
                val = true,
                total = 10,
                i;

            function testCase(promise) {
                return promise.fork(
                    function(data) {
                        return _.expect(data).toBe(a);
                    },
                    function(errors) {
                        _.error('Failed if called')();
                    }
                );
            }

            for(i = 0; i < total; i++) {
                val = val && testCase(promise);
            }

            return val;
        },
        [_.AnyVal]
    ),
    'test deferred is called twice when fork is called': _.check(
        function(a) {
            var called = 0;
                promise = _.Promise(function(resolve, reject) {
                called += 1;
                resolve(a);
            });
            promise.fork(function() {}, function() {});
            promise.fork(function() {}, function() {});
            return called === 2;
        },
        [_.AnyVal]
    ),
    'test deferred is called 2 times when fork is called async': function(test) {
        var expected = 41,
            promise = _.Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(expected);
                }, 50);
            });

        function testCase(promise) {
            promise.fork(
                function(data) {
                    test.equal(expected, data);
                },
                function(errors) {
                    _.error('Failed if called')();
                }
            );
        }

        testCase(promise);

        setTimeout(function() {
            testCase(promise);
        }, 40);
        setTimeout(function() {
            test.expect(2);
            test.done();
        }, 100);
    },
    'testing of with fork should return correct value': _.check(
        function(a) {
            return _.Promise.of(a).fork(
                function(b) {
                    return _.expect(b).toBe(a);
                },
                function(errors) {
                    _.error('Failed if called')();
                }
            );
        },
        [_.AnyVal]
    ),
    'testing error with fork should return correct value': _.check(
        function(a) {
            return _.Promise.error(a).fork(
                function(a) {
                    _.error('Failed if called')();
                },
                function(b) {
                    return _.expect(b).toBe(a);
                }
            );
        },
        [_.AnyVal]
    ),
    'when using chaining promises together the promises should chain correctly': _.check(
        function(a) {
            return _.Promise.of(a).chain(
                    function(a) {
                        return _.Promise.of(a + 1);
                    }
                ).fork(
                    function(b) {
                        return _.expect(b).toBe(a + 1);
                    },
                    function(errors) {
                        _.error('Failed if called')();
                    }
                );
        },
        [Number]
    ),
    'when using chaining promises together and one has an error the promises should chain correctly': _.check(
        function(a) {
            return _.Promise.of(a).chain(
                    function(a) {
                        return _.Promise.error(a + 1);
                    }
                ).fork(
                    function(a) {
                        _.error('Failed if called')();
                    },
                    function(b) {
                        return _.expect(b).toBe(a + 1);
                    }
                );
        },
        [Number]
    ),
    'when using reject on promises should return correct value': _.check(
        function(a) {
            return _.Promise.error(a).reject(
                    function(a) {
                        return _.Promise.error(a + 1);
                    }
                ).fork(
                    function(a) {
                        _.error('Failed if called')();
                    },
                    function(b) {
                        return _.expect(b).toBe(a + 1);
                    }
                );
        },
        [Number]
    ),
    'when using reject with of on promises should return correct value': _.check(
        function(a) {
            return _.Promise.error(a).reject(
                    function(a) {
                        return _.Promise.of(a + 1);
                    }
                ).fork(
                    function(b) {
                        return _.expect(b).toBe(a + 1);
                    },
                    function(errors) {
                        _.error('Failed if called')();
                    }
                );
        },
        [Number]
    ),
    'when using map on promises should return correct value': _.check(
        function(a) {
            return _.Promise.of(a).map(
                    function(a) {
                        return a + 1;
                    }
                ).fork(
                    function(b) {
                        return _.expect(b).toBe(a + 1);
                    },
                    function(errors) {
                        _.error('Failed if called')();
                    }
                );
        },
        [Number]
    ),
    'when using map on error with promises should return correct value': _.check(
        function(a) {
            return _.Promise.error(a).map(
                    function(a) {
                        return a + 1;
                    }
                ).fork(
                    function(b) {
                        _.error('Failed if called')();
                    },
                    function(b) {
                        return _.expect(b).toBe(a);
                    }
                );
        },
        [Number]
    ),
    'when using reject on of with promises should return correct value': _.check(
        function(a) {
            return _.Promise.of(a).reject(
                    function(a) {
                        return a + 1;
                    }
                ).fork(
                    function(b) {
                        return _.expect(b).toBe(a);
                    },
                    function(b) {
                        _.error('Failed if called')();
                    }
                );
        },
        [Number]
    ),
    'when using extract on promises should return correct value': _.check(
        function(a) {
            return _.expect(_.Promise.of(a).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using extract on error with promises should return correct value': _.check(
        function(a) {
            return _.expect(_.Promise.error(a).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when creating a promise and using lens should be correct value': _.check(
        function(a, b) {
            var fork = function(resolve, reject) {
                    return resolve(b);
                },
                promise = _.Promise.lens().run(a).set(fork);

            return promise.fork(
                function(x) {
                    return _.expect(x).toBe(b);
                },
                function() {
                    _.error('Failed if called')();
                }
            );
        },
        [_.promiseOf(_.AnyVal), _.AnyVal]
    )
};

exports.promiseT = {
    'when testing promiseT map should return correct value': _.check(
        function(a) {
            var promiseT = _.Promise.PromiseT(_.Promise.of(a)),
                actual = promiseT(_.Promise.of(a)).map(_.inc),
                expected = promiseT(_.Promise.of(a + 1));

            return resolveEquality(actual, expected);
        },
        [_.AnyVal]
    ),
    'when testing promiseT chain should return correct value': _.check(
        function(a, b) {
            var promiseT0 = _.Promise.PromiseT(_.Promise.of(a)),
                promiseT1 = _.Promise.PromiseT(_.Promise.of(b)),
                actual = promiseT0(_.Promise.of(a)).chain(
                    function() {
                        return promiseT1(_.Promise.of(b));
                    }
                ),
                expected = promiseT0(_.Promise.of(b));

            return resolveEquality(actual, expected);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when creating a promiseT and using chain should be correct value': _.check(
        function(a, b) {
            var monad = _.Promise.of(1),
                transformer = _.Promise.PromiseT(monad),
                actual = transformer(_.Promise.of(b)).chain(function(x) {
                    return _.Promise.PromiseT(monad).of(x + 1);
                }),
                expected = _.Promise.PromiseT(monad).of(b + 1);

            return resolveEquality(actual, expected);
        },
        [Number, Number]
    ),
    'when creating a promiseT using promiseTOf and chain should be correct value': _.check(
        function(a, b) {
            var actual = a(_.Promise.of(b)).chain(function(x) {
                    return _.Promise.PromiseT(_.Promise.of(1)).of(x + 1);
                }),
                expected = _.Promise.PromiseT(_.Promise.of(1)).of(b + 1);

            return resolveEquality(actual, expected);
        },
        [_.promiseTOf(Number), Number]
    ),
    'when creating a promiseT using promiseTOf and map should be correct value': _.check(
        function(a, b) {
            var actual = _.map(
                    a(_.Promise.of(b)),
                    function(x) {
                        return x + 1;
                    }
                ),
                expected = _.Promise.PromiseT(_.Promise.of(1)).of(b + 1);

            return resolveEquality(actual, expected);
        },
        [_.promiseTOf(Number), Number]
    )
};
