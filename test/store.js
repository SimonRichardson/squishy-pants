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
                        this.value = v;
                    },
                    function() {
                        return this.value;
                    }
                );

            store.set(a);

            return _.expect(store.get()).toBe(a);
        },
        [_.AnyVal]
    )/*,
    'when testing store with map should return correct value': _.check(
        function(a) {
            var store = _.Store(
                    function(v) {
                        this.value = v;
                        return this;
                    },
                    function() {
                        return this.value;
                    }
                ).set(a);

            console.log(store.map(
                function(a) {
                    console.log('...',a);
                    return a + 1;
                }
            ).get());

            return true;//_.expect().toBe(a + 1);
        },
        [Number]
    )*/
};