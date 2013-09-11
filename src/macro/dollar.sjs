//
//  ## Dollar notation
//
//  ### $
//
//  The $ operator is for avoiding parenthesis. Anything appearing after it
//  will take precedence over anything that comes before.
//
//       func $ show $ 1 + 2
//
//  De-sugars into:
//
//       func(show(1 + 2))
//
macro $ {
    case {_ $x $rest ... } => {
        return #{ ($x $rest ...) }
    }
}