var _ = require('./lib/test'),
    Transformer = _.tagged('Transformer', ['x']),
    TransformerT = _.transformer(_.tagged('TransformerT', ['run']));

Transformer.of = function(x) {
    return Transformer(x);
};

Transformer.empty = function() {
    return Transformer('');
};

Transformer.prototype.chain = function(f) {
    return f(this.x);
};

Transformer.prototype.equal = function(b) {
    return _.equal(this.x, b.x);
};

Transformer.prototype.map = function(f) {
    return this.chain(function(a) {
        return Transformer.of(f(a));
    });
};

exports.transformer = {
    'when testing Transformer of should return correct value': _.check(
        function(a) {
            var actual = TransformerT(Transformer).of(a);
            return _.expect(actual.run.x).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing Transformer empty should return correct value': function(test) {
        var actual = TransformerT(Transformer).empty();
        test.ok(actual.run.x === '');
        test.done();
    },
    'when testing Transformer lift should return correct value': _.check(
        function(a) {
            var actual = TransformerT(Transformer).lift(Transformer(a));
            return _.expect(actual.run.x).toBe(a);
        },
        [_.AnyVal]
    ),
    'when testing Transformer chain should return correct value': _.check(
        function(a, b) {
            var trans = TransformerT(Transformer),
                actual = trans.of(a).chain(function() {
                    return trans.of(b);
                });

            return _.expect(actual.run.x).toBe(b);
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing Transformer map should return correct value': _.check(
        function(a, b) {
            var trans = TransformerT(Transformer),
                actual = trans.of(a).map(function() {
                    return b;
                });

            return _.expect(actual.run.x).toBe(b);
        },
        [_.AnyVal, _.AnyVal]
    )
};