import { untracked } from "@owanturist/signal"

beforeEach((context) => {
  context.monitor = untracked((monitor) => monitor)
})

afterAll(() => {
  vi.useRealTimers()
})
