//
//  ## Semigroup concat
//
//  Identities are supported:
//
//       $concat (x + y + z)
//
//  De-sugars:
//
//       squishy.concat(x, squishy.concat(y, z))
//
macro $concat {
    case {_ ($x + $inner ...) $rest ... } => {
        return #{squishy.concat($x, $concat ($inner ...)) $rest ...};
    }
    case {_ ($x)} => {
        return #{$x};
    }
}