var _ = require('./lib/test');

exports.store = {
    'when testing store with extract should return correct value': _.check(
        function(a) {
            var store = _.Store(
                    _.identity,
                    function() {
                        return a;
                    }
                );
            return _.expect(store.extract()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing store with extend should return correct value': _.check(
        function(a) {
            var store = _.Store(
                    _.identity,
                    function() {
                        return a;
                    }
                );
            return _.expect(store.extend().get()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing store with get should return correct value': _.check(
        function(a) {
            var store = _.Store(
                    _.identity,
                    function() {
                        return a;
                    }
                );
            return _.expect(store.get()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing store with set should return correct value': _.check(
        function(a) {
            var store = _.Store(
                    function(v) {
                        return v + 1;
                    },
                    function() {
                        return a;
                    }
                );

            return _.expect(store.get()).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing store with map should return correct value': _.check(
        function(a) {
            var store = _.Store(
                    function(v) {
                        return v;
                    },
                    function() {
                        return a;
                    }
                ),
                newStore = store.map(
                    function(a) {
                        return a + 1;
                    }
                );

            return _.expect(newStore.extract()).toBe(a + 1);
        },
        [Number]
    ),
    'when testing store using set plus one with map should return correct value': _.check(
        function(a) {
            var store = _.Store(
                    function(v) {
                        return v + 1;
                    },
                    function() {
                        return a;
                    }
                ),
                newStore = store.map(
                    function(a) {
                        return a + 1;
                    }
                );

            return _.expect(newStore.extract()).toBe(a + 2);
        },
        [Number]
    ),
    'when creating a store and using lens should be correct value': _.check(
        function(a, b) {
            var store = _.Store.lens().run(a).set(b);

            return _.expect(store.get()).toBe(b);
        },
        [_.storeOf(_.AnyVal), _.AnyVal]
    )
};