var _ = require('./test'),
    Add = {},
    Div = {},
    Min = {},
    Mul = {},
    AddInvalid = {},
    DivInvalid = {},
    MinInvalid = {},
    MulInvalid = {},
    Branch = {},
    BranchInvalid = {},
    NumberOrInvalid = {},
    Generate = {},
    GenerateInvalid = {};

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

function invalidStatementToArray(str) {
    var index = str.indexOf('/');
    if (index < 0) {
        return _.Success([statementToArray(str)]);
    }
    return _.Failure([['/', index]]);
}

_ = _
    .property('Add', Add)
    .method('arb', _.strictEquals(Add), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);

        return statement('add', x, y);
    })
    .property('Div', Div)
    .method('arb', _.strictEquals(Div), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);
        return statement('div', x, y);
    })
    .property('Min', Min)
    .method('arb', _.strictEquals(Min), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);
        return statement('min', x, y);
    })
    .property('Mul', Mul)
    .method('arb', _.strictEquals(Mul), function(a, b) {
        var x = this.arb(Branch, b - 1),
            y = this.arb(Branch, b - 1);
        return statement('mul', x, y);
    })
    .property('AddInvalid', AddInvalid)
    .method('arb', _.strictEquals(AddInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);

        return statement('add', x, y);
    })
    .property('DivInvalid', DivInvalid)
    .method('arb', _.strictEquals(DivInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);
        return statement('div', x, y);
    })
    .property('MinInvalid', MinInvalid)
    .method('arb', _.strictEquals(MinInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);
        return statement('min', x, y);
    })
    .property('MulInvalid', MulInvalid)
    .method('arb', _.strictEquals(MulInvalid), function(a, b) {
        var x = this.arb(BranchInvalid, b - 1),
            y = this.arb(BranchInvalid, b - 1);
        return statement('mul', x, y);
    })
    .property('Branch', Branch)
    .method('arb', _.strictEquals(Branch), function(a, b) {
        if (b <= 0 || this.randomRange(0, 1) < 0.5) {
            return this.arb(Number, b - 1);
        }
        return this.arb(Generate, b - 1);
    })
    .property('BranchInvalid', BranchInvalid)
    .method('arb', _.strictEquals(BranchInvalid), function(a, b) {
        if (b <= 0 || this.randomRange(0, 1) < 0.5) {
            return this.arb(NumberOrInvalid, b - 1);
        }
        return this.arb(GenerateInvalid, b - 1);
    })
    .property('NumberOrInvalid', NumberOrInvalid)
    .method('arb', _.strictEquals(NumberOrInvalid), function(a, b) {
        if(this.randomRange(0, 1) < 0.5) {
            return '/';
        }
        return this.arb(Number, b - 1);
    })
    .property('Generate', Generate)
    .method('arb', _.strictEquals(Generate), function(a, b) {
        var types = [Add, Mul, Div, Min],
            value = this.arb(this.oneOf(types), b - 1);
        return value;
    })
    .property('GenerateInvalid', GenerateInvalid)
    .method('arb', _.strictEquals(GenerateInvalid), function(a, b) {
        var types = [AddInvalid, MulInvalid, DivInvalid, MinInvalid],
            value = this.arb(this.oneOf(types), b - 1);
        return value;
    })
    .property('statementToArray', statementToArray)
    .property('invalidStatementToArray', invalidStatementToArray);

exports = module.exports = _;
