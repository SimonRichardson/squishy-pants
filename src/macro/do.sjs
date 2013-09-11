//
//  ## Do
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
macro $do {
    case {_ { $x:ident <- $m:expr if $rest ... }} => {
        return #{
            $m.map(
                function($x) {
                    $ifelsedo { if $rest ... }
                }
            );
        }
    }
    case {_ {$x:ident <- $m:expr return $y:expr }} => {
        return #{
            $m.map(
                function($x) {
                    return $y;
            }
        );
      }
    }
    case {_ {$m:expr return $b:expr }} => {
        return #{
            $m.map(
                function() {
                    return $b;
                }
            );
        }
    }
    case {_ {$x:ident = $do { $block ... } $rest ... }} => {
        return #{
            (function() {
                var $x = (function() {
                    return $do { $block ... }
                })();
                return $do { $rest ... }
            })()
        }
    }
    case {_ {$x:ident = $y:expr $rest ... }} => {
        return #{
            (function() {
                var $x = $y;
                return $do { $rest ... }
            })();
        }
    }
    case {_ {$x:ident <- $m:expr $rest ... }} => {
        return #{
            $m.chain(
                function($x) {
                    return $do { $rest ... }
                }
            );
        }
    }
}

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
    case {_ { if $e:expr { $left ... } else { $right ... } }} => {
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
}
