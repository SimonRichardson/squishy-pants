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
    case {_ $f:ident ($x:expr (,) ...) } => {
      return #{$f $(.ap($x)) ...};
   }
   case {_ ($f:expr)($x:expr (,) ...) } => {
         return #{$f $(.ap($x)) ...};
    }
    case {_ ($f:expr) } => {
         return #{$ap $f};
    }
}