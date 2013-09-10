//
//  ## Semigroup concat
//
//  Identities are supported:
//
//       $concat (x + y + z)
//
//  De-sugars:
//
//       x.concat(y.concat(z))
//
macro $concat {
    case {_ ($z + ($x + $rest ...) + $y) } => {
        return #{$concat ($y + ($concat ($z + ($concat ($x + $rest ...)))))};
    }
    case {_ ($z + ($x + $rest ...)) } => {
        return #{$concat ($z + ($concat ($x + $rest ...)))};
    }
    case {_ (($x + $rest ...) + $z ...) } => {
        return #{$concat ($z ... + ($concat ($x + $rest ...)))};
    }
    case {_ ($x + $rest ...) } => {
        return #{$x.concat($concat ($rest ...))};
    }
    case {_ ($x)} => {
        return #{$x};
    }
}