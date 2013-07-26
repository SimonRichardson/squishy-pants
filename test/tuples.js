var _ = require('./lib/test');

exports.tuple2 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple2,
        [_.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    )
};

exports.tuple3 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple3,
        [_.AnyVal, _.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    )
};

exports.tuple4 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple4,
        [_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    )
};

exports.tuple5 = {
    'when checking constructor arguments': _.checkTaggedArgs(
        _.Tuple5,
        [_.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal, _.AnyVal],
        function (tuple, index) {
            return tuple['_' + (index + 1)];
        }
    )
};

