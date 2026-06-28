function Tuple<const TElements extends Array<unknown>>(...args: TElements): TElements {
  return args
}

export { Tuple }
