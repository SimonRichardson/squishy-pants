// instrument by jscoverage, do not modifly this file
(function () {
  var BASE;
  if (typeof global === 'object') {
    BASE = global;
  } else if (typeof window === 'object') {
    BASE = window;
  } else {
    throw new Error('[jscoverage] unknow ENV!');
  }
  if (!BASE._$jscoverage) {
    BASE._$jscoverage = {};
    BASE._$jscoverage_cond = {};
    BASE._$jscoverage_done = function (file, line, express) {
      if (arguments.length === 2) {
        BASE._$jscoverage[file][line] ++;
      } else {
        BASE._$jscoverage_cond[file][line] ++;
        return express;
      }
    };
    BASE._$jscoverage_init = function (base, file, lines) {
      var tmp = [];
      for (var i = 0; i < lines.length; i ++) {
        tmp[lines[i]] = 0;
      }
      base[file] = tmp;
    };
  }
})();
_$jscoverage_init(_$jscoverage, "test/array.js",[1,3,6,12,12,14,15,16,23,26,27,27,30,36,39,40,40,43]);
_$jscoverage_init(_$jscoverage_cond, "test/array.js",[12,27,40]);
_$jscoverage["test/array.js"].source = ["var _ = require('./lib/test');","","exports.array = {","    'when testing concat with array should yield merged array': _.check(","        function(a, b) {","            return _.concat(a, b).toString() === a.concat(b).toString();","        },","        [_.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal)]","    ),","    'when testing exists with array should yield item': _.check(","        function(a) {","            if (a.length === 0) return true;","","            var index = Math.floor(_.randomRange(0, a.length));","            return _.exists(a, function(v) {","                return v === a[index];","            });","        },","        [_.arrayOf(_.AnyVal)]","    ),","    'when testing filter with array should yield items': _.check(","        function(a) {","            var accum = [],","                i;","","            for(i = 0; i < a.length; i++) {","                if (_.isEven(a[i])) accum.push(a[i]);","            }","","            return _.filter(a, _.isEven).toString() === accum.toString();","        },","        [_.arrayOf(Number)]","    ),","    'when testing filterNot with array should yield items': _.check(","        function(a) {","            var accum = [],","                i;","","            for(i = 0; i < a.length; i++) {","                if (_.isOdd(a[i])) accum.push(a[i]);","            }","","            return _.filterNot(a, _.isEven).toString() === accum.toString();","        },","        [_.arrayOf(Number)]","    )","};"];
_$jscoverage_done("test/array.js", 1);
var _ = require("./lib/test");

_$jscoverage_done("test/array.js", 3);
exports.array = {
    "when testing concat with array should yield merged array": _.check(function(a, b) {
        _$jscoverage_done("test/array.js", 6);
        return _.concat(a, b).toString() === a.concat(b).toString();
    }, [ _.arrayOf(_.AnyVal), _.arrayOf(_.AnyVal) ]),
    "when testing exists with array should yield item": _.check(function(a) {
        _$jscoverage_done("test/array.js", 12);
        if (_$jscoverage_done("test/array.js", 12, a.length === 0)) {
            _$jscoverage_done("test/array.js", 12);
            return true;
        }
        _$jscoverage_done("test/array.js", 14);
        var index = Math.floor(_.randomRange(0, a.length));
        _$jscoverage_done("test/array.js", 15);
        return _.exists(a, function(v) {
            _$jscoverage_done("test/array.js", 16);
            return v === a[index];
        });
    }, [ _.arrayOf(_.AnyVal) ]),
    "when testing filter with array should yield items": _.check(function(a) {
        _$jscoverage_done("test/array.js", 23);
        var accum = [], i;
        _$jscoverage_done("test/array.js", 26);
        for (i = 0; i < a.length; i++) {
            _$jscoverage_done("test/array.js", 27);
            if (_$jscoverage_done("test/array.js", 27, _.isEven(a[i]))) {
                _$jscoverage_done("test/array.js", 27);
                accum.push(a[i]);
            }
        }
        _$jscoverage_done("test/array.js", 30);
        return _.filter(a, _.isEven).toString() === accum.toString();
    }, [ _.arrayOf(Number) ]),
    "when testing filterNot with array should yield items": _.check(function(a) {
        _$jscoverage_done("test/array.js", 36);
        var accum = [], i;
        _$jscoverage_done("test/array.js", 39);
        for (i = 0; i < a.length; i++) {
            _$jscoverage_done("test/array.js", 40);
            if (_$jscoverage_done("test/array.js", 40, _.isOdd(a[i]))) {
                _$jscoverage_done("test/array.js", 40);
                accum.push(a[i]);
            }
        }
        _$jscoverage_done("test/array.js", 43);
        return _.filterNot(a, _.isEven).toString() === accum.toString();
    }, [ _.arrayOf(Number) ])
};