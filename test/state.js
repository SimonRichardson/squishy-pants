var _ = require('./lib/test');

function snd(t) {
    return t._2;
}

function discard(a, b) {
    return a.chain(function() {
        return b;
    });
}

function replicate(a, x) {
    var r = [],
        i;

    for(i = 0; i < a.length; i++) {
        r.push(x(a[i]));
    }
    return r;
}

function next(f) {
    return discard(
        _.State.modify(function(t) {
            return _.Tuple2(t._1, t._2 + f());
        }),
        _.State.get.map(snd)
    );
}

function verbal() {
    var args = [].slice.call(arguments),
        result = _.reduce(
                replicate(args, next),
                function(a, b) {
                    return discard(a, b);
                }
            ).evalState(_.Tuple2('', ''));

    return new RegExp(result, 'gm');
}

function sanitize(value) {
    return value.replace(
            /[^\w]/g,
            function(character) {
                return "\\" + character;
            }
        );
}

function startWith(value) {
    return function() {
        return '^' + then(value)();
    };
}

function endWith(value) {
    return function() {
        return then(value)() + '$';
    };
}

function then(value) {
    return function() {
        return '(?:' + sanitize(value) + ')';
    };
}

function maybe(value) {
    return function() {
        return '(?:' + sanitize(value) + ')?';
    };
}

function anythingBut(value) {
    return function() {
        return '(?:[^' + sanitize(value) + ']*)';
    };
}

exports.state = {
    'when building a verbal expression should generate the correct value': function(test) {
        var result = verbal(
                    startWith('http'),
                    maybe('s'),
                    then('://'),
                    maybe('www.'),
                    anythingBut(' ')
                );

        test.ok('/^(?:http)(?:s)?(?:\\:\\/\\/)(?:www\\.)?(?:[^\\ ]*)/gm' === result.toString());
        test.done();
    }
};