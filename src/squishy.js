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

squishy = squishy
    .property('functionName', functionName)
    .property('functionLength', functionLength)
    .property('create', create)
    .property('getInstance', getInstance)
    .property('singleton', singleton)
    .property('extend', extend);