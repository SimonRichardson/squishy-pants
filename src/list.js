//
//  # List
//
//      List a = Cons a + Nil
//
//  The list type data type constructs objects which points to values. The `Cons`
//  constructor represents a value, the left is the head (the first element)
//  and the right represents the tail (the second element). The `Nil`
//  constructor is defined as an empty list.
//
//  The following example creates a list of values 1 and 2, where the Nil terminates
//  the list:
//
//      Cons(1, Cons(2, Nil));
//
//  The following can also represent tree like structures (Binary Trees):
//
//      Cons(Cons(1, Cons(2, Nil)), Cons(3, Cons(4, Nil)));
//
//             *
//            / \
//           *   *
//          / \ / \
//         1  2 3  4
//
//   * `ap(a, b)` - Applicative ap(ply)
//   * `concat(a)` - semigroup concat
//   * `count(a, f)` - Count the number of elements in the list which satisfy a predicate.
//   * `drop(a, n)` - Returns the list without its n first elements. If this list has less than n elements, the empty list is returned.
//   * `dropRight(a, n)` - Returns the list without its rightmost `n` elements.
//   * `dropWhile(a, f)` - Returns the longest suffix of this list whose first element does not satisfy the predicate.
//   * `extract()` -  extract the value from option
//   * `equal(a)` -  `true` if `a` is equal to `this`
//   * `fold(a, b)` - applies `a` to value if `Cons` or defaults to `b`
//   * `map(f)` - functor map
//   * `flatMap(f)` - monadic flatMap
//   * `append(a)` - append
//   * `appendAll(a)` - append values
//   * `prepend(a)` - prepend value
//   * `prependAll(a)` - prepend values
//   * `reverse()` - reverse
//   * `exists()` - test by predicate
//   * `filter()` - filter by predicate
//   * `partition()` - partition by predicate
//   * `reduce(a, f)` - Combines the elements of this list together using the binary operator op, from Left to Right
//   * `reduceRight(a, f)` - Combines the elements of this list together using the binary operator op, from Right to Left
//   * `size()` - size of the list
//   * `take(n)` - Returns the n first elements of this list.
//   * `takeRight(n)` - Returns the rightmost n elements from this list.
//   * `takeWhile(f)` - Returns the longest prefix of this list whose elements satisfy the predicate.
//   * `zip(a, b)` - Returns a list formed from this list and the specified list that by associating each element of the former with the element at the same position in the latter.
//   * `zipWithIndex(a)` -  Returns a list form from this list and a index of the value that is associated with each element index position.
//
var List = taggedSum('List', {
    Cons: ['head', 'tail'],
    Nil: []
});

//
//  ### range(a, b)
//
//  Create a list from a range of values.
//
List.range = curry(function(a, b) {
    var total = b - a;
    var rec = function(x, y) {
        if (y - a >= total) return done(x);
        return cont(function() {
            return rec(List.Cons(y, x), ++y);
        });
    };
    return trampoline(rec(List.Nil, a));
});

//
//  ### fromArray()
//
//  Returns a list from an array.
//
List.fromArray = function(array) {
    var total = array.length,
        accum = List.Nil,
        i;

    for(i = total - 1; i >= 0; --i) {
        accum = accum.prepend(array[i]);
    }

    return accum;
};

//
//  ### ap(b, [concat])
//
//  Apply a function in the applicative of each function
//  Applicative ap(ply)
//
List.prototype.ap = function(b) {
    var accum = List.Nil,
        a = this,
        x = b;

    while(a.isNonEmpty) {
        b = x;
        while(b.isNonEmpty) {
            accum = accum.prepend(a.head(b.head));
            b = b.tail;
        }
        a = a.tail;
    }

    return accum.reverse();
};

//
//  ### append(a)
//
//  Append a value to the current list returning a new list.
//
List.prototype.append = function(a) {
    return this.appendAll(List.Cons(a, List.Nil));
};

//
//  ### appendAll(a)
//
//  Append a list of values to the current list returning a new list.
//
List.prototype.appendAll = function(a) {
    var accum = a;
    var p = this.reverse();

    while(p.isNonEmpty) {
        accum = List.Cons(p.head, accum);
        p = p.tail;
    }

    return accum;
};

//
//  ### concat(s)
//
//  Appends two list objects.
//  semigroup concat
//
List.prototype.concat = function(s) {
    return this.appendAll(s);
};

//
//  ### count(f)
//
//  Count the number of elements in the list which satisfy a predicate.
//
List.prototype.count = function(f) {
    var rec = function(a, b) {
        if (a.isEmpty) return done(b);

        return cont(function() {
            return rec(a.tail, f(a.head) ? inc(b) : b);
        });
    };
    return trampoline(rec(this, 0));
};

//
//  ### drop(n)
//
//  Returns the list without its n first elements. If this list has less than n elements, the empty list is returned.
//
List.prototype.drop = function(n) {
    var rec = function(a, b) {
        if (a.isEmpty || b < 1) return done(a);

        return cont(function() {
            return rec(a.tail, --b);
        });
    };
    return trampoline(rec(this, n));
};

//
//  ### dropRight(n)
//
//  Returns the list without its rightmost `n` elements.
//
List.prototype.dropRight = function(n) {
    if (n < 1) return List.Nil;

    var rec = function(a, b, c) {
        if (a.isEmpty || c < 1) return done(b);

        return cont(function() {
            return rec(a.tail, b.prepend(a.head), --c);
        });
    };
    return trampoline(rec(this, List.Nil, this.size() - n)).reverse();
};

//
//  ### dropWhile(f)
//
//  Returns the longest suffix of this array whose first element
//  does not satisfy the predicate.
//
List.prototype.dropWhile = function(f) {
    var env = this,
        rec = function(a, b) {
            if (a.isEmpty) return done(0);
            else if(!f(a.head)) return done(b);

            return cont(function() {
                return rec(a.tail, ++b);
            });
        },
        index = trampoline(rec(this, 0));

    return this.drop(index);
};

//
//  ### exists(f)
//
//  Tests the existence in this list of an element that satisfies
//  the predicate.
//
List.prototype.exists = function(f) {
    var p = this;

    while(p.isNonEmpty) {
        if(f(p.head)) {
            return true;
        }
        p = p.tail;
    }
    return false;
};

//
//  ### extract()
//
//  Extract the value from the list.
//
List.prototype.extract = function() {
    return this.match({
        Cons: function(a) {
            return a;
        },
        Nil: constant(null)
    });
};

//
//  ### equal(b)
//
//  Compare two list values for equality
//
List.prototype.equal = function(b) {
    var accum = true,
        a = this;
    while(a.isNonEmpty && b.isNonEmpty) {
        accum = accum && squishy.equal(a.head, b.head);

        if (!accum) {
            break;
        }

        a = a.tail;
        b = b.tail;
    }
    /* Check for length of lists as well */
    return accum ? a.isEmpty && b.isEmpty : false;
};

//
//  ### filter(f)
//
//  Returns all the elements of this list that satisfy the predicate p.
//
List.prototype.filter = function(f) {
    var rec = function(a, b) {
        if (a.isEmpty) return done(b);

        return cont(function() {
            var c = curry(rec)(a.tail);
            if (f(a.head)) {
                return c(List.Cons(a.head, b));
            } else {
                return c(b);
            }
        });
    };
    return trampoline(rec(this, List.Nil)).reverse();
};

//
//  ### flatMap(f)
//
//  Applies the given function f to each element of this list, then
//  concatenates the results.
//
List.prototype.flatMap = function(f) {
    return this.fold(
        List.Nil,
        function(a, b) {
            return a.appendAll(f(b));
        }
    );
};

//
//  ### fold(v, f)
//
//  Combines the elements of this list together using the binary function f,
//  from Left to Right, and starting with the value v.
//
List.prototype.fold = function(v, f) {
    var rec = function(a, b) {
        if (a.isEmpty) return done(b);

        return cont(function() {
            return rec(a.tail, f(b, a.head));
        });
    };
    return trampoline(rec(this, v));
};

//
//  ### get(index)
//
//  Get the given item at the correct index
//
List.prototype.get = function(index) {
    var accum = null,
        i = -1,
        p = this;

    while(p.isNonEmpty && i < index) {
        accum = p.head;
        p = p.tail;
        i++;
    }
    return accum;
};

//
//  ### map(f)
//
//  Returns the list resulting from applying the given function f to each
//  element of this list.
//
List.prototype.map = function(f) {
    return this.fold(
        List.Nil,
        function(a, b) {
            return List.Cons(f(b), a);
        }
    );
};

//
//  ### partition(f)
//
//  Partition the list in two sub-lists according to a predicate.
//
List.prototype.partition = function(f) {
    if (this.isEmpty) return Tuple2(this, this);

    var rec = function(a, l, r) {
        if (a.isEmpty) return done(Tuple2(l.reverse(), r.reverse()));

        return cont(function() {
            var h = a.head;
            var cur = curry(List.Cons)(h);
            if (f(h)) {
                return rec(a.tail, cur(l), r);
            } else {
                return rec(a.tail, l, cur(r));
            }
        });
    };
    return trampoline(rec(this, List.Nil, List.Nil));
};

//
//  ### prepend(a)
//
//  Prepend a value to the current list returning a new list.
//
List.prototype.prepend = function(a) {
    return List.Cons(a, this);
};

//
//  ### prependAll(a)
//
//  Prepend a list of values to the current list returning a new list.
//
List.prototype.prependAll = function(a) {
    var rec = function(a, b) {
        if (a.isEmpty) return done(b);

        return cont(function() {
            return rec(a.tail, List.Cons(a.head, b));
        });
    };
    return trampoline(rec(a, this));
};

//
//  ### reduce(f)
//
//  Combines the elements of this list together using the binary operator
//  op, from Left to Right
//
List.prototype.reduce = function(f) {
    if (this.isEmpty) return null;

    var rec = function(a, b) {
        if (a.isEmpty) return done(b);

        return cont(function() {
            return rec(a.tail, f(b, a.head));
        });
    };
    return trampoline(rec(this.tail, this.head));
};

//
//  ### reduceRight(f)
//
//  Combines the elements of this list together using the binary operator
//  op, from Right to Left
//
List.prototype.reduceRight = function(f) {
    return this.reverse().reduce(f);
};

//
//  ### reverse()
//
//  Reverse the list as a new list.
//
List.prototype.reverse = function() {
    var rec = function(p, accum) {
        return p.match({
            Cons: function(a, b) {
                return cont(function() {
                    return rec(p.tail, List.Cons(a, accum));
                });
            },
            Nil: function() {
                return done(accum);
            }
        });
    };
    return trampoline(rec(this, List.Nil));
};

//
//  ### size()
//
//  size of the list
//
List.prototype.size = function() {
    var rec = function(a, b) {
        if (a.isEmpty) return done(b);

        return cont(function() {
            return rec(a.tail, ++b);
        });
    };
    return trampoline(rec(this, 0));
};

//
//  ### take(n)
//
//  Returns the n first elements of this list.
//
List.prototype.take = function(n) {
    var accum = List.Nil,
        i = 0,
        p = this;

    while(p.isNonEmpty && i < n) {
        accum = List.Cons(p.head, accum);
        p = p.tail;
        i++;
    }
    return accum.reverse();
};

//
//  ### takeRight(n)
//
//  Returns the rightmost n elements from this list.
//
List.prototype.takeRight = function(n) {
    if (n < 1) return this;

    var rec = function(a, b, c) {
        if (a.isEmpty || c < 1) return done(b);

        return cont(function() {
            return rec(a.tail, b.prepend(a.head), --c);
        });
    };
    return trampoline(rec(this.reverse(), List.Nil, n));
};

//
//  ### takeWhile(f)
//
//  Returns the longest prefix of this list whose elements satisfy
//  the predicate.
//
List.prototype.takeWhile = function(f) {
    var env = this,
        rec = function(a, b) {
            if (a.isEmpty) return done(0);
            else if(!f(a.head)) return done(b);

            return cont(function() {
                return rec(a.tail, ++b);
            });
        },
        index = trampoline(rec(this, 0));

    return this.take(index);
};

//
//  ### zip(b)
//
//  Returns a list formed from this list and the specified list that
//  by associating each element of the former with the element at the same
//  position in the latter.
//
List.prototype.zip = function(b) {
    var accum = List.Nil,
        x = this,
        y = b;

    while(x.isNonEmpty && y.isNonEmpty) {
        accum = List.Cons(Tuple2(x.head, y.head), accum);
        x = x.tail;
        y = y.tail;
    }
    return accum.reverse();
};

//
//  ### zipWithIndex(b)
//
//  Returns a list form from this list and a index of the value that
//  is associated with each element index position.
//
List.prototype.zipWithIndex = function(b) {
    var accum = List.Nil,
        index = 0,
        p = this;

    while(p.isNonEmpty) {
        accum = List.Cons(Tuple2(p.head, index++), accum);
        p = p.tail;
    }
    return accum.reverse();
};

//
//  ### toArray()
//
//  Returns a list as a array.
//
List.prototype.toArray = function() {
    var accum = [],
        p = this;
    while(p.isNonEmpty) {
        accum.push(p.head);
        p = p.tail;
    }
    return accum;
};

List.prototype.toString = function() {
    return 'List(' + this.toArray().join(', ') + ')';
};

//
//  ## Cons(a, b)
//
//  Constructor to represent the existence of a value in a list, `a`
//  and a reference to another `b`.
//
List.Cons.prototype.isEmpty = false;
List.Cons.prototype.isNonEmpty = true;

//
//  ## Nil
//
//  Represents an empty list (absence of a list).
//
List.Nil.isEmpty = true;
List.Nil.isNonEmpty = false;

//
//  ## isList(a)
//
//  Returns `true` if `a` is a `Cons` or `Nil`.
//
var isList = isInstanceOf(List);

//
//  ## listOf(type)
//
//  Sentinel value for when an list of a particular type is needed:
//
//       listOf(Number)
//
function listOf(type) {
    var self = getInstance(this, listOf);
    self.type = type;
    return self;
}

//
//  ## isListOf(a)
//
//  Returns `true` if `a` is an instance of `listOf`.
//
var isListOf = isInstanceOf(listOf);

squishy = squishy
    .property('List', List)
    .property('Cons', List.Cons)
    .property('Nil', List.Nil)
    .property('isList', isList)
    .property('listOf', listOf)
    .property('isListOf', isListOf)
    .property('listRange', List.range)
    .method('arb', isListOf, function(a, b) {
        var accum = [],
            length = this.randomRange(0, b),
            i;

        for(i = 0; i < length; i++) {
            accum.push(this.arb(a.type, b - 1));
        }

        return List.fromArray(accum);
    })
    .method('shrink', isList, function(a) {
        var accum = [List.Nil],
            x = a.size();

        while(x) {
            x = Math.floor(x / 2);

            if (x) accum.push(a.take(x));
        }

        return accum;
    })
    .method('ap', isList, function(a, b) {
        return a.ap(b);
    })
    .method('concat', isList, function(a, b) {
        return a.concat(b);
    })
    .method('count', isList, function(a, b) {
        return a.count(b);
    })
    .method('drop', isList, function(a, b) {
        return a.drop(b);
    })
    .method('dropRight', isList, function(a, b) {
        return a.dropRight(b);
    })
    .method('dropWhile', isList, function(a, b) {
        return a.dropWhile(b);
    })
    .method('equal', isList, function(a, b) {
        return a.equal(b);
    })
    .method('exists', isList, function(a, f) {
        return a.exists(f);
    })
    .method('flatMap', isList, function(a, b) {
        return a.flatMap(b);
    })
    .method('fold', isList, function(a, f, g) {
        return a.fold(f, g);
    })
    .method('map', isList, function(a, b) {
        return a.map(b);
    })
    .method('partition', isList, function(a, f) {
        return a.partition(f);
    })
    .method('reduce', isList, function(a, f) {
        return a.reduce(f);
    })
    .method('reduceRight', isList, function(a, f) {
        return a.reduceRight(f);
    })
    .method('take', isList, function(a, b) {
        return a.take(b);
    })
    .method('takeRight', isList, function(a, b) {
        return a.takeRight(b);
    })
    .method('zip', isList, function(a, b) {
        return a.zip(b);
    })
    .method('zipWithIndex', isList, function(a, b) {
        return a.zipWithIndex(b);
    })
    .method('toArray', isList, function(a) {
        return a.toArray();
    });
