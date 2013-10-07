var _ = require('./test'),
    Add = {},
    Mul = {},
    Branch = {},
    Generate = {};

function statement(a, b, c) {
    return '(' + a + ' ' + b + ' ' + c + ')';
}

// This is a horrible alternative to the parser for unwrapping
function statementToArray(str) {
    var rec = function(str) {
        var index = str.indexOf('('),
            name = '',
            arg0,
            arg1,
            spaceIndex,
            rightIndex;

        if (index === 0) {
            nameIndex = str.indexOf(' ');
            name = str.slice(1, nameIndex);

            arg0 = rec(str.slice(nameIndex + 1));
            arg1 = rec(arg0[0]);

            return [arg1[0].slice(1), [name, arg0[1], arg1[1]]];
        } else {
            spaceIndex = str.indexOf(' ');
            rightIndex = str.indexOf(')');

            if (spaceIndex >= 0 && spaceIndex < rightIndex) {
                return [str.slice(spaceIndex + 1), str.slice(0, spaceIndex)];
            } else {
                return [str.slice(rightIndex + 1), str.slice(0, rightIndex)];
            }
        }
    };

    return rec(str)[1];
}

_ = _
    .property('Add', Add)
    .method('arb', _.strictEquals(Add), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);

        return statement('add', x, y);
    })
    .property('Mul', Mul)
    .method('arb', _.strictEquals(Mul), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);
        return statement('mul', x, y);
    })
    .property('Branch', Branch)
    .method('arb', _.strictEquals(Branch), function(a, b) {
        if (b <= 0 || this.randomRange(0, 1) < 0.5) {
            return this.arb(Number, b - 1);
        }
        return this.arb(Generate, b - 1);
    })
    .property('Generate', Generate)
    .method('arb', _.strictEquals(Generate), function(a, b) {
        var types = [Add],//, Mul],
            value = this.arb(this.oneOf(types), b - 1);
        return value;
    })
    .property('statementToArray', statementToArray);

exports = module.exports = _;
