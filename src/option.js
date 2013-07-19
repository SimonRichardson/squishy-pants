//
//   # Option
//
//       Option a = Some a + None
//
//   The option type encodes the presence and absence of a value. The
//   `some` constructor represents a value and `none` represents the
//   absence.
//
var Option = taggedSum('Option', {
    some: ['value'],
    none: []
});

Option.prototype.fold = function(f, g) {
    return this.match({
        some: f,
        none: g
    });
};

//
//  ## of(x)
//
//  Constructor `of` Monad creating `Option` with value of `x`.
//
Option.of = function(x) {
    return Option.some(x);
};

//
//  ## some(x)
//
//  Constructor to represent the existence of a value, `x`.
//
Option.some.prototype.isSome = true;
Option.some.prototype.isNone = false;

//
//  ## none
//
//  Represents the absence of a value.
//
Option.none.isSome = false;
Option.none.isNone = true;

//
//  ## isOption(a)
//
//  Returns `true` if `a` is a `some` or `none`.
//
var isOption = isInstanceOf(Option);

squishy = squishy
    .property('some', Option.some)
    .property('none', Option.none)
    .property('isOption', isOption)
    .method('fold', isOption, function(a, b, c) {
        return a.fold(b, c);
    });