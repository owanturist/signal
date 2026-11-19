import "@testing-library/jest-dom/vitest"
import { untracked } from "@owanturist/signal"

import { toHaveEmittersSize } from "@owanturist/internals/testing/to-have-emitters-size"

beforeEach((context) => {
  context.monitor = untracked((monitor) => monitor)
})

afterAll(() => {
  vi.useRealTimers()
})

expect.extend({
  toHaveEmittersSize(received: unknown, size: number) {
    return toHaveEmittersSize(this.utils, received, size)
  },
})
