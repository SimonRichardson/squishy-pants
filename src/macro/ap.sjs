//
//  ## Applicative ap(ply)
//
//  Identities are supported:
//
//       $ap f(x, y, z)
//
//  De-sugars:
//
//       f.ap(x).ap(y).ap(z)
//
//  Expressions are also supported:
//
//       $ap (f(100))(x, y, z)
//
//  De-sugars:
//
//        f(100).ap(x).ap(y).ap(z)
//
macro $ap {
    case {_ $f ($x, $rest ...) } => {
        return #{ $ap (squishy.ap($f, $x)) $($rest ...) }
    }
    case {_ $x($rest ...) } => {
        return #{ squishy.ap($x, $rest ...) }
    }
    case {_ ($f:expr) } => {
        return #{$ap $f};
    }
}