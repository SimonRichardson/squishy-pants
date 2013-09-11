//
//  ## $list (a)
//
//  Creates a list of items from a series of ident
//
//      $list (1 + 2 + 3)
//
//  De-sugars into:
//
//      squishy.Nil.append(1).append(2).append(3)
//
//  And therefore using minus allows you to prepend:
//
//      $list (1 - 2 - 3)
//
//  De-sugars into:
//
//      squishy.Nil.prepend(1).prepend(2).prepend(3)
//
macro $list {
    case {_ ($x - $rest ...) } => {
        return #{ squishy.Nil.prepend($x) $list - $rest ... }
    }
    case {_ - $x $rest ... } => {
        return #{ .prepend($x) $list $rest ... }
    }
    case {_ ($x + $rest ...) } => {
        return #{ squishy.Nil.append($x) $list + $rest ... }
    }
    case {_ + $x $rest ... } => {
        return #{ .append($x) $list $rest ... }
    }
    case {_} => {
        return #{}
    }
}