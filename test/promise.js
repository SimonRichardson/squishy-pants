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
                _.error('Failed if called')
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
                    _.error('Failed if called')
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
                _.error('Failed if called')
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
                _.error('Failed if called')
            );
        },
        [_.AnyVal]
    ),
    'testing error with fork should return correct value': _.check(
        function(a) {
            return _.Promise.error(a).fork(
                _.error('Failed if called'),
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
                    _.error('Failed if called')
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
                    _.error('Failed if called'),
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
                    _.error('Failed if called'),
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
                    _.error('Failed if called')
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
                    _.error('Failed if called')
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
                    _.error('Failed if called'),
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
                    _.error('Failed if called')
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
    'when using expand with promises should return correct value': _.check(
        function(a) {
            return _.expect(_.Promise.of(a).expand(
                function(x) {
                    return x.extract();
                }
            ).extract()).toBe(a);
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
                _.error('Failed if called')
            );
        },
        [_.promiseOf(_.AnyVal), _.AnyVal]
    ),
    'when creating a promise and using get lens should be correct value': _.check(
        function(a) {
            var fork = _.Promise.lens().run(a).get().fork;

            return fork(
                function(x) {
                    return _.expect(x).toBe(a.extract());
                },
                _.error('Failed if called')
            );
        },
        [_.promiseOf(_.AnyVal)]
    ),
    'when using toStream should be correct value': _.checkStream(
        function(a) {
            return _.toStream(_.Promise.of(a)).equal(_.Stream.of(a));
        },
        [_.AnyVal]
    ),
    'when using of should be correct value': _.check(
        function(a) {
            return _.expect(_.of(_.Promise, a).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using empty should be correct value': _.check(
        function(a) {
            return _.expect(_.empty(_.Promise).extract()).toBe(null);
        },
        [_.AnyVal]
    ),
    'when using chain should be correct value': _.check(
        function(a) {
            return _.expect(_.chain(_.Promise.of(a), function(x) {
                return _.Promise.of(x);
            }).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using expand should be correct value': _.check(
        function(a) {
            return _.expect(_.expand(_.Promise.of(a), function(x) {
                return x.extract();
            }).extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using extract should be correct value': _.check(
        function(a) {
            return _.expect(_.extract(_.Promise.of(a))).toBe(a);
        },
        [_.AnyVal]
    ),
    'when using shrink should be correct value': _.check(
        function(a) {
            return _.expect(_.shrink(_.Promise.of(a))).toBe([]);
        },
        [_.AnyVal]
    )
};
