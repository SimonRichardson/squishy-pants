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
//  TODO:
//
//  - do not require last expression to be 'return'
//
macro $do {
    case { $x:ident = $y:expr $rest ... } => {
        function() {
            var $x = $y;
            return $do { $rest ... }
        }()
    }
    case { $a:ident <- $ma:expr return $b:expr } => {
        $ma.map(function($a) {
            return $b;
        });
    }
    case { $a:ident <- $ma:expr return if $rest ... } => {
        $ma.map(function($a) {
            $ifelsedo { if $rest ... }
        });
    }
    case { $ma:expr return $b:expr } => {
        $ma.map(function() {
            return $b;
        });
    }
    case { $a:ident <- $ma:expr if $e:expr return $left:expr else return $right:expr } => {
        $ma.map(function($a) {
            if ($e) { return $left }
            else    { return $right }
        });
    }
    case { $ma:expr if $e:expr return $left:expr else return $right:expr } => {
        $ma.map(function() {
            if ($e) { return $left }
            else    { return $right }
        });
    }
    case { $a:ident <- $ma:expr if $rest ... } => {
        $ma.chain(function($a) {
            $ifelsedo { if $rest ... }
        });
    }
    case { $ma:expr if $rest ... } => {
        $ma.chain(function() {
            $ifelsedo { if $rest ... }
        });
    }
    case { $a:ident <- $ma:expr $rest ... } => {
        $ma.chain(function($a) {
            return $do { $rest ... }
        });
    }
    case { $a:ident <- $do { $doBlock ... } return $b:expr } => {
        function() {
            var ma = $do { $doBlock ... }
            return ma.map(function($a) {
                return $b
            });
        }()
    }
    case { $a:ident <- $do { $doBlock ... } $rest ... } => {
        function() {
            var ma = $do { $doBlock ... }
            return ma.chain(function($a) {
                return $do { $rest ... }
            });
        }()
    }
    case { $ma:expr $rest ... } => {
        $ma.chain(function() {
            return $do { $rest ... }
        });
    }
}

//
//  ## if..else..do
//
//       $do {
//         a <- foo
//         if (a == 1) $do {
//           b <- bar
//           return b
//         } else $do {
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
macro $ifelsedo {
    case { if $e:expr $do { $left ... } else return $right:expr } => {
        if ($e) { return $do { $left ... } }
        else    { return $right }
    }
    case { if $e:expr return $left:expr else $do { $right ... } } => {
        if ($e) { return $left }
        else    { return $do { $right ... } }
    }
    case { if $e:expr $do { $left ... } else $do { $right ... } } => {
        if ($e) { return $do { $left ... } }
        else    { return $do { $right ... } }
    }
    case { if $e:expr return $left:expr else $rest ... } => {
        if ($e) { return $left }
        else $ifelsedo { $rest ... }
    }
    case { if $e:expr $do { $left ... } else $rest ... } => {
        if ($e) { return $do { $left ... } }
        else $ifelsedo { $rest ... }
    }
}
