var _ = require('./lib/test');

exports.option = {
    'when testing some with getOrElse should return correct value': _.check(
        function(a, b) {
            return _.Some(a).getOrElse(b) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing none with getOrElse should return correct value': _.check(
        function(a) {
            return _.None.getOrElse(a) == a;
        },
        [_.AnyVal]
    ),
    'when testing some with toLeft should fold to correct value': _.check(
        function(a, b) {
            return _.Some(a).toLeft(b).fold(_.identity, _.badRight) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing none with toLeft should fold to correct value': _.check(
        function(a, b) {
            return _.None.toLeft(a).fold(_.badLeft, _.identity) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing some with toRight should fold to correct value': _.check(
        function(a, b) {
            return _.Some(a).toRight(b).fold(_.badLeft, _.identity) == a;
        },
        [_.AnyVal, _.AnyVal]
    ),
    'when testing none with toRight should fold to correct value': _.check(
        function(a, b) {
           return _.None.toRight(a).fold(_.identity, _.badRight) == a;
        },
        [_.AnyVal, _.AnyVal]
    )
};
