type Lazy<T> = () => T

function lazy<T>(init: () => T): Lazy<T> {
  let value: null | { _current: T } = null

  return () => {
    value ??= { _current: init() }

    return value._current
  }
}

export type { Lazy }
export { lazy }
