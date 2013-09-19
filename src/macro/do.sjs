//
//  ## Do
//
//  ### $do
//
//  Do notation alternative syntax for chaining structures together.
//
//       $do {
//         x <- foo
//         y <- bar
//         z <- baz
//         return x * y * z
//       }
//
//  De-sugars into:
//
//       foo.chain(function(x) {
//         return bar.chain(function(y) {
//           return baz.map(function(z) {
//             return x * y * z
//           })
//         })
//       })
//
//  var-bindings are supported too:
//
//       $do {
//         x <- foo
//         k = 10
//         y <- bar(x)
//         z <- baz
//         return x * y * z * k
//       }
//
//  Variable binding is optional if monad is executed just for its effects:
//
//       $do {
//         putStrLn("Hello friend! What's your name?")
//         name <- readLine()
//         return name
//       }
//
//  Nesting do notation blocks are also allowed - consider the following:
//
//       $do {
//         x <- foo
//         y = $do {
//            i <- blah
//            return i
//         }
//         z <- baz
//         return x * y * z
//       }
//
macro $do {
    case {_ { $x:ident <- $m:expr if $rest ... }} => {
        return #{
            squishy.map(
                $m,
                function($x) {
                    $ifelsedo { if $rest ... }
                }
            );
        }
    }
    case {_ { $x:ident <- $m:expr return $y:expr }} => {
        return #{
            squishy.map(
                $m,
                function($x) {
                    return $y;
            }
        );
      }
    }
    case {_ { $m:expr return $b:expr }} => {
        return #{
            squishy.map(
                $m,
                function() {
                    return $b;
                }
            );
        }
    }
    case {_ { $x:ident = $do { $block ... } $rest ... }} => {
        return #{
            (function() {
                var $x = (function() {
                    return $do { $block ... }
                })();
                return $do { $rest ... }
            })()
        }
    }
    case {_ { $x:ident = $y:expr $rest ... }} => {
        return #{
            (function() {
                var $x = $y;
                return $do { $rest ... }
            })();
        }
    }
    case {_ { $x:ident <- $m:expr $rest ... }} => {
        return #{
            squishy.chain(
                $m,
                function($x) {
                    return $do { $rest ... }
                }
            );
        }
    }
    case {_ { return $x:expr }} => {
        return #{ $do { $x }}
    }
    case {_ { return $x:ident }} => {
        return #{$x}
    }
    case {_ { $x:expr }} => {
        return #{ $x }
    }
    case {_ {}} => {
        return #{null}
    }
}


//
//  ### $ifelsedo
//
//  Allowing if statements in a do notation block.
//  Anything found after a else block is ignored and not outputted once run
//  through sweet.js
//
//       $do {
//         a <- foo
//         if (a == 1) {
//           b <- bar
//           return b
//         } else {
//           c <- quux
//           return c
//         }
//       }
//
//  De-sugars into:
//
//       foo.map(function (a$2) {
//         if (a$2 == 1) {
//           return bar.map(function (b$6) {
//             return b$6;
//           });
//         } else {
//           return quux.map(function (c$9) {
//             return c$9;
//           });
//         }
//       });
//
//
macro $ifelsedo {
    case {_ { if $e:expr { $left ... } else return $right:expr }} => {
        return #{
            if ($e) {
                return $do { $left ... }
            } else {
                return $right
            }
        }
    }
    case {_ { if $e:expr return $left:expr else { $right ... } }} => {
        return #{
            if ($e) {
                return $left
            } else {
                return $do { $right ... }
            }
        }
    }
    case {_ { if $e:expr { $left ... } else { $right ... } $rest ... }} => {
        return #{
            if ($e) {
                return $do { $left ... }
            } else {
                return $do { $right ... }
            }
        }
    }
    case {_ { if $e:expr { $left ... } else if $rest ... }} => {
        return #{
            if ($e) {
                return $do { $left ... }
            } else $ifelsedo { if $rest ... }
        }
    }
    case {_ { if $e:expr { $left ... } $rest ... }} => {
        return #{
            if ($e) {
                return $do { $left ... }
            }
            return $do { $rest ... }
        }
    }
}
