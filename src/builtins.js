squishy = squishy
    .method('map', isFunction, function(a, b) {
        return compose(b, a);
    })
    .method('concat', isFunction, function(a, b) {
        return a().concat(b());
    })
    .method('ap', isFunction, function(a, b) {
        return function(x) {
            return a(x)(b(x));
        };
    });

squishy = squishy
    .method('map', isBoolean, function(a, b) {
        return b(a);
    })
    .method('concat', isBoolean, function(a, b) {
        return a & b;
    })
    .method('map', squishy.liftA2(or, isNumber, isString), function(a, b) {
        return b(a);
    })
    .method('concat', squishy.liftA2(or, isNumber, isString), function(a, b) {
        return a + b;
    });

//
//  ### arbitrary values
//
//  Creates an arbitrary value depending on the type.
//
//       console.log(squishy.arb(Number)); // Outputs a random number
//
squishy = squishy
    .method('arb', strictEquals(AnyVal), function(a, s) {
        var types = [Boolean, Number, String];
        return this.arb(this.oneOf(types), s - 1);
    })
    .method('arb', strictEquals(Array), function(a, s) {
        return this.arb(arrayOf(AnyVal), s - 1);
    })
    .method('arb', strictEquals(Boolean), function(a, s) {
        return Math.random() < 0.5;
    })
    .method('arb', strictEquals(Char), function(a, s) {
        /* Should consider 127 (DEL) to be quite dangerous? */
        return String.fromCharCode(Math.floor(this.randomRange(32, 127)));
    })
    .method('arb', strictEquals(Function), function(a, s) {
        return function(){};
    })
    .method('arb', isArrayOf, function(a, s) {
        var accum = [],
            length = this.randomRange(0, s),
            i;

        for(i = 0; i < length; i++) {
            accum.push(this.arb(a.type, s - 1));
        }

        return accum;
    })
    .method('arb', isObjectLike, function(a, s) {
        var o = {},
            i;

        for(i in a.props) {
            o[i] = this.arb(a.props[i]);
        }

        return o;
    })
    .method('arb', strictEquals(Number), function(a, s) {
        /*
          Divide the Number.MAX_VALUE by the goal, so we don't get
          a Number overflow (worst case Infinity), meaning we can
          add multiple arb(Number) together without issues.
        */
        var variance = Number.MAX_VALUE / this.goal;
        return this.randomRange(-variance, variance);
    })
    .method('arb', strictEquals(Object), function(a, s) {
        var o = {},
            length = this.randomRange(0, s),
            i;

        for(i = 0; i < length; i++) {
            o[this.arb(String, s - 1)] = this.arb(arrayOf(AnyVal), s - 1);
        }

        return o;
    })
    .method('arb', strictEquals(String), function(a, s) {
        return this.arb(arrayOf(Char), s - 1).join('');
    });

//
//  ### empty values
//
//  Creates an empty value depending on the type. Each resulting value
//  will be classified as falsy for the type. Boolean will be
//  `false` and Array will be an empty `[]` for example.
//
//       console.log(squishy.empty(Array)); // Outputs `[]`
//
squishy = squishy
    .method('empty', strictEquals(AnyVal), function() {
        var types = [Boolean, Number, String];
        return this.empty(this.oneOf(types));
    })
    .method('empty', strictEquals(Array), function() {
        return [];
    })
    .method('empty', strictEquals(Boolean), function() {
        return false;
    })
    .method('empty', strictEquals(Function), function() {
        return function() {};
    })
    .method('empty', strictEquals(Number), function() {
        return 0;
    })
    .method('empty', strictEquals(Object), function() {
        return {};
    })
    .method('empty', strictEquals(String), function() {
        return '';
    });

squishy = squishy
    .method('shrink', isArray, function(a) {
        var accum = [[]],
            x = a.length;

        while(x) {
            x = Math.floor(x / 2);

            if (x) accum.push(a.slice(a.length = x));
        }

        return accum;
    })
    .method('shrink', isBoolean, function(b) {
        return b ? [false] : [];
    })
    .method('shrink', isNumber, function(n) {
        var accum = [0],
            x = n;

        if (n < 0) accum.push(-n);

        while(x) {
            x = x / 2;
            x = x < 0 ? Math.ceil(x) : Math.floor(x);

            if (x) accum.push(n - x);
        }

        return accum;
    })
    .method('shrink', isString, function(s) {
        var accum = [''],
            x = s.length;

        while(x) {
            x = Math.floor(x / 2);

            if (x) accum.push(s.substring(0, s.length - x));
        }

        return accum;
    });
