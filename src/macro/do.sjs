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
   case {_ {$x:ident <- $m:expr = $y:expr }} => {
       return #{
            $m.map(
                function($x) {
                    return $y;
                }
            );
        }
   }
   case {_ {$m:expr = $b:expr }} => {
       return #{
            $m.map(
                function() {
                    return $b;
                }
            );
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
