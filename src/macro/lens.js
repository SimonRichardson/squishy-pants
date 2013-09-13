macro $lens {
  case {_ ($x, $y ...) $rest ...} => {
    return #{lens.parse($y ...).run($x) $rest ...}
  }
}
