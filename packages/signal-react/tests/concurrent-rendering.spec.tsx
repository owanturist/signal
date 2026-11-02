import { type Monitor, type ReadableSignal, Signal, effect, untracked } from "@owanturist/signal"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import {
  type FC,
  type ReactNode,
  StrictMode,
  Suspense,
  lazy,
  memo,
  startTransition,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useState,
  useTransition,
} from "react"

import { useComputed, useMonitor } from "../src"

type UseValue = (signal: ReadableSignal<number>) => number

/**
 * Long enough for React to split a render into several time slices,
 * so a write can land in the middle of the render.
 */
const SLOW_READERS = Array.from({ length: 8 }, (_, index) => index)
const SLOW_READER_MS = 4

function blockThread(ms: number): void {
  const end = performance.now() + ms

  while (performance.now() < end) {
    // blocks the thread on purpose: this is what makes React yield between readers
  }
}

function readDisplayedValues(): ReadonlyArray<null | string> {
  return screen.queryAllByTestId("reader").map((node) => node.textContent)
}

/**
 * Collects what all the readers display at the moment of every commit.
 * Readers displaying different values at the same commit (tearing) join into something like `0,1`.
 */
function createCommitLog(): {
  commit: VoidFunction
  read: () => ReadonlyArray<string>
} {
  const commits = new Set<string>()

  return {
    commit: () => {
      commits.add([...new Set(readDisplayedValues())].join())
    },
    read: () => [...commits],
  }
}

/**
 * Creates a lazy component that stays suspended until revealed.
 */
function createSuspended(): [FC, VoidFunction] {
  let reveal: VoidFunction = () => undefined

  const loaded = new Promise<{ default: FC }>((resolve) => {
    reveal = () => {
      resolve({ default: () => null })
    }
  })

  return [
    lazy(() => loaded),
    () => {
      reveal()
    },
  ]
}

/**
 * Writes in the middle of a render, so the readers rendered before it have seen the previous value.
 */
const WriteOnRender: FC<{
  source: Signal<number>
  monitor: Monitor
}> = ({ source, monitor }) => {
  if (source.read(monitor) === 0) {
    source.write(1)
  }

  return null
}

/**
 * Renders nothing until the button click opens the children in a transition.
 */
const OpenInTransition: FC<{
  children: ReactNode
  prefix?: ReactNode
}> = ({ children, prefix }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          startTransition(() => {
            setIsOpen(true)
          })
        }}
      />
      {prefix}
      {isOpen && children}
    </>
  )
}

describe.each<{
  name: string
  derive: boolean
  useValue: UseValue
}>([
  {
    name: "useComputed(signal)",
    derive: false,
    useValue: (signal) => useComputed(signal),
  },
  {
    name: "useComputed(derivedSignal)",
    derive: true,
    useValue: (signal) => useComputed(signal),
  },
  {
    name: "useComputed(compute)",
    derive: false,
    useValue: (signal) => useComputed((monitor) => signal.read(monitor), [signal]),
  },
  {
    name: "useMonitor()",
    derive: false,
    useValue: (signal) => signal.read(useMonitor()),
  },
])("concurrent rendering with $name", ({ derive, useValue }) => {
  function setup(): { source: Signal<number>; signal: ReadableSignal<number> } {
    const source = Signal(0)

    return {
      source,
      signal: derive ? Signal((monitor) => source.read(monitor)) : source,
    }
  }

  const Reader: FC<{
    signal: ReadableSignal<number>
    onCommit?: VoidFunction
    onRender?: (value: number) => void
  }> = ({ signal, onCommit, onRender }) => {
    const value = useValue(signal)

    onRender?.(value)

    useLayoutEffect(() => {
      onCommit?.()
    })

    return <span data-testid="reader">{value}</span>
  }

  describe("transitions", () => {
    it("re-renders readers mounting in a transition when a write lands between them", ({
      monitor,
    }) => {
      const { source, signal } = setup()
      const log = createCommitLog()
      const onRender = vi.fn()

      render(
        <OpenInTransition>
          <Reader signal={signal} onCommit={log.commit} onRender={onRender} />
          <WriteOnRender source={source} monitor={monitor} />
          <Reader signal={signal} onCommit={log.commit} onRender={onRender} />
        </OpenInTransition>,
      )

      fireEvent.click(screen.getByRole("button"))

      // the first reader has seen the value before the write...
      expect(onRender).toHaveBeenCalledWith(0)
      // ...but it never reaches the screen
      expect(log.read()).toStrictEqual(["1"])
      expect(readDisplayedValues()).toStrictEqual(["1", "1"])

      // the re-rendered readers are subscribed
      act(() => {
        source.write(2)
      })
      expect(readDisplayedValues()).toStrictEqual(["2", "2"])
    })

    it("lets a discarded render be garbage collected", async ({ monitor }) => {
      const { source, signal } = setup()

      const { unmount } = render(
        <OpenInTransition>
          <Reader signal={signal} />
          <WriteOnRender source={source} monitor={monitor} />
          <Reader signal={signal} />
        </OpenInTransition>,
      )

      fireEvent.click(screen.getByRole("button"))
      expect(readDisplayedValues()).toStrictEqual(["1", "1"])

      // the Object.is spy from setup-tests remembers the compared snapshots, which refer to the emitters
      vi.clearAllMocks()
      await globalThis.gc?.({ execution: "async" })
      expect(signal).toHaveEmittersSize(2)

      unmount()
      expect(signal).toHaveEmittersSize(0)
    })

    it("detaches a discarded render on the next write", ({ monitor }) => {
      const { source, signal } = setup()

      render(
        <OpenInTransition>
          <Reader signal={signal} />
          <WriteOnRender source={source} monitor={monitor} />
          <Reader signal={signal} />
        </OpenInTransition>,
      )

      fireEvent.click(screen.getByRole("button"))

      act(() => {
        source.write(2)
      })
      expect(readDisplayedValues()).toStrictEqual(["2", "2"])
      expect(signal).toHaveEmittersSize(2)
    })

    it("does not defer a signal write made inside a transition", () => {
      const { source, signal } = setup()
      const commits: Array<string> = []

      const Component: FC = () => {
        const value = useValue(signal)
        const [state, setState] = useState(0)

        useLayoutEffect(() => {
          commits.push(`${value}:${state}`)
        })

        return (
          <button
            type="button"
            onClick={() => {
              startTransition(() => {
                setState(1)
                source.write(1)
              })
            }}
          />
        )
      }

      render(<Component />)
      expect(commits).toStrictEqual(["0:0"])

      fireEvent.click(screen.getByRole("button"))

      // an external store update is always synchronous, only the state update waits for the transition
      expect(commits).toStrictEqual(["0:0", "1:0", "1:1"])
    })
  })

  describe("time slicing", () => {
    beforeEach(() => {
      // let React schedule the work on its own instead of flushing it all at once in `act`
      vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", false)
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    const SlowReader: FC<{
      signal: ReadableSignal<number>
      prefix: number
      onCommit: VoidFunction
      onRender: (value: string) => void
    }> = ({ signal, prefix, onCommit, onRender }) => {
      const value = useValue(signal)
      const text = `${prefix}:${value}`

      blockThread(SLOW_READER_MS)
      onRender(text)

      useLayoutEffect(onCommit)

      return <span data-testid="reader">{text}</span>
    }

    it("does not commit stale or torn values when a write interrupts an updating transition", async () => {
      const { source, signal } = setup()
      const log = createCommitLog()
      const onRender = vi.fn()

      const Component: FC = () => {
        const [tick, setTick] = useState(0)

        return (
          <>
            <button
              type="button"
              onClick={() => {
                startTransition(() => {
                  setTick(1)
                })
              }}
            />
            {SLOW_READERS.map((key) => (
              <SlowReader
                key={key}
                signal={signal}
                prefix={tick}
                onCommit={log.commit}
                onRender={onRender}
              />
            ))}
          </>
        )
      }

      render(<Component />)
      onRender.mockClear()

      screen.getByRole("button").click()
      await vi.waitFor(() => expect(onRender).toHaveBeenCalled(), { interval: 1 })
      source.write(1)

      await waitFor(() => {
        expect(new Set(readDisplayedValues())).toStrictEqual(new Set(["1:1"]))
      })

      // the transition has started before the write...
      expect(onRender).toHaveBeenCalledWith("1:0")
      // ...but only the new value commits: first urgently, then with the restarted transition
      expect(log.read()).toStrictEqual(["0:0", "0:1", "1:1"])
    })

    it("does not commit stale or torn values when a write interrupts a mounting transition", async () => {
      const { source, signal } = setup()
      const log = createCommitLog()
      const onRender = vi.fn()

      render(
        <OpenInTransition prefix={<Reader signal={signal} onCommit={log.commit} />}>
          {SLOW_READERS.map((key) => (
            <Reader
              key={key}
              signal={signal}
              onCommit={log.commit}
              onRender={(value) => {
                blockThread(SLOW_READER_MS)
                onRender(value)
              }}
            />
          ))}
        </OpenInTransition>,
      )

      screen.getByRole("button").click()
      await vi.waitFor(() => expect(onRender).toHaveBeenCalled(), { interval: 1 })
      source.write(1)

      await waitFor(() => {
        expect(readDisplayedValues()).toHaveLength(SLOW_READERS.length + 1)
      })

      expect(onRender).toHaveBeenCalledWith(0)
      expect(log.read()).toStrictEqual(["0", "1"])
    })

    it("restarts a slow deferred render when a newer write lands", async () => {
      const { source, signal } = setup()
      const commits = new Set<string>()
      const onRender = vi.fn()

      const SlowChild = memo<{ value: number }>(({ value }) => {
        blockThread(SLOW_READER_MS)
        onRender(value)

        return <span data-testid="reader">{value}</span>
      })

      const Component: FC = () => {
        const value = useValue(signal)
        const deferred = useDeferredValue(value)

        useLayoutEffect(() => {
          commits.add(`${value}:${deferred}`)
        })

        return (
          <>
            {SLOW_READERS.map((key) => (
              <SlowChild key={key} value={deferred} />
            ))}
          </>
        )
      }

      render(<Component />)

      source.write(1)
      await vi.waitFor(() => expect(onRender).toHaveBeenCalledWith(1), { interval: 1 })
      source.write(2)

      await waitFor(() => {
        expect(new Set(readDisplayedValues())).toStrictEqual(new Set(["2"]))
      })

      // the deferred value skips the abandoned 1 and catches up with the latest value
      expect([...commits]).toStrictEqual(["0:0", "1:0", "2:0", "2:2"])
    })
  })

  describe("useDeferredValue", () => {
    it("updates urgently first and catches up with the deferred value after", () => {
      const { source, signal } = setup()
      const commits: Array<string> = []

      const Component: FC = () => {
        const value = useValue(signal)
        const deferred = useDeferredValue(value)

        useLayoutEffect(() => {
          commits.push(`${value}:${deferred}`)
        })

        return null
      }

      render(<Component />)
      expect(commits).toStrictEqual(["0:0"])

      act(() => {
        source.write(1)
      })
      expect(commits).toStrictEqual(["0:0", "1:0", "1:1"])
    })
  })

  describe("Suspense", () => {
    it("keeps mounted readers updating while a transition is suspended", async () => {
      const { source, signal } = setup()
      const [Suspended, reveal] = createSuspended()

      const Component: FC = () => {
        const [isPending, start] = useTransition()
        const [isOpen, setIsOpen] = useState(false)

        return (
          <>
            <button
              type="button"
              aria-busy={isPending}
              onClick={() => {
                start(() => {
                  setIsOpen(true)
                })
              }}
            />
            <Reader signal={signal} />
            <Suspense fallback={<span data-testid="fallback" />}>
              {isOpen && (
                <>
                  <Reader signal={signal} />
                  <Suspended />
                </>
              )}
            </Suspense>
          </>
        )
      }

      render(<Component />)

      fireEvent.click(screen.getByRole("button"))
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true")
      expect(screen.queryByTestId("fallback")).not.toBeInTheDocument()
      expect(readDisplayedValues()).toStrictEqual(["0"])

      // the write reaches the screen while the transition is pending
      act(() => {
        source.write(1)
      })
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true")
      expect(readDisplayedValues()).toStrictEqual(["1"])

      await act(async () => {
        reveal()
        await Promise.resolve()
      })
      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "false")
      expect(readDisplayedValues()).toStrictEqual(["1", "1"])

      // the reader discarded by the suspended render subscribes when it finally mounts
      act(() => {
        source.write(2)
      })
      expect(readDisplayedValues()).toStrictEqual(["2", "2"])
    })

    it("reveals the latest value after a write made behind a fallback", async () => {
      const { source, signal } = setup()
      const [Suspended, reveal] = createSuspended()

      render(
        <Suspense fallback={<span data-testid="fallback" />}>
          <Reader signal={signal} />
          <Suspended />
        </Suspense>,
      )
      expect(screen.getByTestId("fallback")).toBeInTheDocument()

      act(() => {
        source.write(1)
      })

      await act(async () => {
        reveal()
        await Promise.resolve()
      })
      expect(screen.queryByTestId("fallback")).not.toBeInTheDocument()
      expect(readDisplayedValues()).toStrictEqual(["1"])

      act(() => {
        source.write(2)
      })
      expect(readDisplayedValues()).toStrictEqual(["2"])
    })

    it("keeps a mounted reader up to date while a fallback hides it", async () => {
      const { source, signal } = setup()
      const [Suspended, reveal] = createSuspended()

      const Component: FC = () => {
        const [isOpen, setIsOpen] = useState(false)

        return (
          <>
            <button
              type="button"
              onClick={() => {
                setIsOpen(true)
              }}
            />
            <Suspense fallback={<span data-testid="fallback" />}>
              <Reader signal={signal} />
              {isOpen && <Suspended />}
            </Suspense>
          </>
        )
      }

      render(<Component />)
      expect(readDisplayedValues()).toStrictEqual(["0"])

      fireEvent.click(screen.getByRole("button"))
      expect(screen.getByTestId("fallback")).toBeInTheDocument()

      act(() => {
        source.write(1)
      })

      await act(async () => {
        reveal()
        await Promise.resolve()
      })
      expect(screen.queryByTestId("fallback")).not.toBeInTheDocument()
      expect(readDisplayedValues()).toStrictEqual(["1"])

      act(() => {
        source.write(2)
      })
      expect(readDisplayedValues()).toStrictEqual(["2"])
    })
  })

  describe("between render and subscription", () => {
    it("does not miss a write made in a layout effect of a sibling", () => {
      const { source, signal } = setup()

      const Writer: FC = () => {
        useLayoutEffect(() => {
          source.write(1)
        }, [])

        return null
      }

      render(
        <>
          <Reader signal={signal} />
          <Writer />
        </>,
      )
      expect(readDisplayedValues()).toStrictEqual(["1"])

      act(() => {
        source.write(2)
      })
      expect(readDisplayedValues()).toStrictEqual(["2"])
    })
  })

  describe("StrictMode", () => {
    it("stays subscribed after double-invoked effects", () => {
      const { source, signal } = setup()
      const log = createCommitLog()

      render(
        <StrictMode>
          <Reader signal={signal} onCommit={log.commit} />
          <Reader signal={signal} onCommit={log.commit} />
        </StrictMode>,
      )
      expect(readDisplayedValues()).toStrictEqual(["0", "0"])

      act(() => {
        source.write(1)
      })
      expect(readDisplayedValues()).toStrictEqual(["1", "1"])
      expect(log.read()).toStrictEqual(["0", "1"])
    })

    it("does not fail a transition mounting in StrictMode", () => {
      const { source, signal } = setup()

      render(
        <StrictMode>
          <OpenInTransition>
            <Reader signal={signal} />
          </OpenInTransition>
        </StrictMode>,
      )

      fireEvent.click(screen.getByRole("button"))
      expect(readDisplayedValues()).toStrictEqual(["0"])

      act(() => {
        source.write(1)
      })
      expect(readDisplayedValues()).toStrictEqual(["1"])
    })
  })
})

/**
 * Proves the commit log can see tearing at all. Without it, the tests above
 * would keep passing for the wrong reason if the log stopped recording torn commits.
 */
describe("control: a hook without useSyncExternalStore", () => {
  function useNaiveValue(signal: ReadableSignal<number>): number {
    const [value, setValue] = useState(() => untracked((monitor) => signal.read(monitor)))

    useEffect(
      () =>
        effect((monitor) => {
          setValue(signal.read(monitor))
        }),
      [signal],
    )

    return value
  }

  const NaiveReader: FC<{
    signal: ReadableSignal<number>
    onCommit: VoidFunction
  }> = ({ signal, onCommit }) => {
    const value = useNaiveValue(signal)

    useLayoutEffect(onCommit)

    return <span data-testid="reader">{value}</span>
  }

  it("tears when a write lands between the readers", ({ monitor }) => {
    const source = Signal(0)
    const log = createCommitLog()

    render(
      <OpenInTransition>
        <NaiveReader signal={source} onCommit={log.commit} />
        <WriteOnRender source={source} monitor={monitor} />
        <NaiveReader signal={source} onCommit={log.commit} />
      </OpenInTransition>,
    )

    fireEvent.click(screen.getByRole("button"))

    expect(log.read()).toStrictEqual(["0,1", "1"])
  })
})
