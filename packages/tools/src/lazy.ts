type Lazy<T> = () => T

// biome-ignore lint/nursery/useReactFunctionComponentDefinition: false positive, Lazy is a factory paired with the Lazy type, not a React component
function Lazy<T>(init: () => T): Lazy<T> {
  let value: null | { _current: T } = null

  return () => {
    value ??= { _current: init() }

    return value._current
  }
}

export { Lazy }
