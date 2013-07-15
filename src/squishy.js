function functionName(f) {
    return f._name || f.name;
}

function functionLength(f) {
    return f._length || f.length;
}

function create(proto) {
    function Ctor() {}
    Ctor.prototype = proto;
    return new Ctor();
}

function getInstance(self, constructor) {
    return self instanceof constructor ? self : create(constructor.prototype);
}

function singleton(k, v) {
    var o = {};
    o[k] = v;
    return o;
}

function extend(a, b) {
    var rec = function(a, b) {
        var i;
        for(i in b) {
            a[i] = b[i];
        }
        return a;
    };
    return rec(rec({}, a), b);
}

function bind(f) {
    function curriedBind(o) {
        // If native bind doesn't exist, use a polyfill.
        var args = [].slice.call(arguments, 1),
            g = f.bind.apply(f, [o].concat(args));

        // Let's try and associate all curried functions with the same name as the originator.
        // Can't override length but can set _length for currying
        g._name = functionName(f);
        g._length = Math.max(functionLength(f) - args.length, 0);

        return g;
    }

    // Manual currying since `curry` relies in bind.
    if(arguments.length > 1) return curriedBind.apply(this, [].slice.call(arguments, 1));
    return curriedBind;
}

function curry(f) {
    var a = function() {
        var g = bind(f).apply(f, [this].concat([].slice.call(arguments)));

        if(!functionLength(g)) return g();
        return curry(g);
    };

    // Let's try and associate all curried functions with the same name as the originator.
    // Can't override length but can set _length for currying
    a._name = functionName(f);
    a._length = functionLength(f);

    return a;
}

squishy = squishy
    .property('functionName', functionName)
    .property('functionLength', functionLength)
    .property('create', create)
    .property('getInstance', getInstance)
    .property('singleton', singleton)
    .property('extend', extend)
    .property('bind', bind)
    .property('curry', curry);
