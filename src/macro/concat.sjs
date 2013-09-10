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
    case {_ ($x + $rest ...) } => {
        return #{$x.concat($concat ($rest ...))};
    }
    case {_ ($x)} => {
        return #{$x};
    }
}