var Store = tagged('Store', ['set', 'get']);

//
//  ## isStore(a)
//
//  Returns `true` if `a` is `Store`.
//
var isStore = isInstanceOf(Store);

//
//  append methods to the squishy environment.
//
squishy = squishy
    .property('Store', Store)
    .property('isStore', isStore);