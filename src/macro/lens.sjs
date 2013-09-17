//
//  ## $lens (a)
//
//  Creates a lens from a string.
//
//      $lens ('a.b.c[0].x')
//
//  De-sugars into:
//
//      squishy.Lens.objectLens('a').andThen(Lens.objectLens('b').andThen(Lens.objectLens('c').andThen(Lens.arrayLens('0').andThen('x'))))
//
//
macro $lensBuild {
    case {_ [$x:lit] $rest ...} => {
        return #{_.Lens.arrayLens(parseInt($x, 10)).andThen($lensBuild ($rest ...))}
    }
    case {_ ($x:lit) $rest ...} => {
        var str = #{$x},
            tokenValue = str[0].token.value,
            dotParts = tokenValue.split('.'),
            dotPart = dotParts.shift(),
            arrayAccess = dotPart.split('['),
            first,
            access,
            second,
            third;

        // Targeting an array access.
        if (arrayAccess.length > 1) {
            first = makeValue(arrayAccess.shift(), #{here});

            access = arrayAccess.join('.').split(']');
            second = makeValue(access.join(''), #{here});

            third = makeValue(dotParts.join('.'), #{here});

            return withSyntax($f = [first], $s = [second], $t = [third]) {
                return #{_.Lens.objectLens($f).andThen($lensBuild [$s] $t) $rest ...};
            }
        }

        // Finally put the object lenses together
        return (function() {
            var part,
                rest;

            if (dotParts.length < 1) {
                return #{_.Lens.objectLens($x)}
            }

            part = makeValue(dotPart, #{here});
            rest = makeValue(dotParts.join('.'), #{here});

            return withSyntax($a = [part], $b = [rest]) {
                return #{_.Lens.objectLens($a).andThen($lensBuild ($b)) $rest ...}
            }
        })();

    }
}
macro $lens {
    case {_ ($x:lit) $rest ...} => {
        return #{$lensBuild ($x) $rest ...};
    }
}
