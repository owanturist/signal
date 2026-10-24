import { lazy } from "../src/lazy"

it("should not call initializer until _peek is called", () => {
  const init = vi.fn(() => 42)
  const getValue = lazy(init)

  expect(init).not.toHaveBeenCalled()
  getValue()
  expect(init).toHaveBeenCalledTimes(1)
})

it("should return the same value on multiple _peek calls", () => {
  let count = 0
  const getValue = lazy(() => ++count)

  expect(getValue()).toBe(1)
  expect(getValue()).toBe(1)
})

it("should preserve value after initialization", () => {
  let count = 0
  const getValue = lazy(() => ++count)

  getValue()

  expect(getValue()).toBe(1)
  expect(count).toBe(1)
})
