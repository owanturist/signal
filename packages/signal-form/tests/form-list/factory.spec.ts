import { identity } from "~/tools/identity"

import { FormList, FormShape, FormUnit } from "../../src"

describe("initialization", () => {
  it("initializes empty elements with no input/initial provided", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input))

    expect(form.getInitial(monitor)).toStrictEqual([])
    expect(form.getInput(monitor)).toStrictEqual([])
    expect(form.isDirty(monitor)).toBe(false)

    const elements = form.getElements(monitor)
    expect(elements.map((element) => element.getInitial(monitor))).toStrictEqual([])
    expect(elements.map((element) => element.getInput(monitor))).toStrictEqual([])
    expect(elements.map((element) => element.isDirty(monitor))).toStrictEqual([])
  })

  it("initializes elements with only input provided", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1, 2],
    })

    expect(form.getInitial(monitor)).toStrictEqual([])
    expect(form.getInput(monitor)).toStrictEqual([1, 2])
    expect(form.isDirty(monitor)).toBe(true)

    const elements = form.getElements(monitor)
    expect(elements.map((element) => element.getInitial(monitor))).toStrictEqual([1, 2])
    expect(elements.map((element) => element.getInput(monitor))).toStrictEqual([1, 2])
    expect(elements.map((element) => element.isDirty(monitor))).toStrictEqual([false, false])
  })

  it("initializes elements with only initial provided", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      initial: [1, 2],
    })

    expect(form.getInitial(monitor)).toStrictEqual([1, 2])
    expect(form.getInput(monitor)).toStrictEqual([1, 2])
    expect(form.isDirty(monitor)).toBe(false)

    const elements = form.getElements(monitor)
    expect(elements.map((element) => element.getInitial(monitor))).toStrictEqual([1, 2])
    expect(elements.map((element) => element.getInput(monitor))).toStrictEqual([1, 2])
    expect(elements.map((element) => element.isDirty(monitor))).toStrictEqual([false, false])
  })

  it("initializes elements with both initial and input provided", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      initial: [1, 2],
      input: [1, 3, 4],
    })

    expect(form.getInitial(monitor)).toStrictEqual([1, 2])
    expect(form.getInput(monitor)).toStrictEqual([1, 3, 4])
    expect(form.isDirty(monitor)).toBe(true)

    const elements = form.getElements(monitor)
    expect(elements.map((element) => element.getInitial(monitor))).toStrictEqual([1, 2, 4])
    expect(elements.map((element) => element.getInput(monitor))).toStrictEqual([1, 3, 4])
    expect(elements.map((element) => element.isDirty(monitor))).toStrictEqual([false, true, false])
  })
})

describe("setInput auto-grow", () => {
  it("grows the list via the factory when setInput is longer than current", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1],
    })

    form.setInput([10, 20, 30])

    expect(form.getInput(monitor)).toStrictEqual([10, 20, 30])
    expect(form.getElements(monitor)).toHaveLength(3)
  })

  it("truncates the list when setInput is shorter than current", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1, 2, 3],
    })

    form.setInput([9])

    expect(form.getInput(monitor)).toStrictEqual([9])
    expect(form.getElements(monitor)).toHaveLength(1)
  })

  it("grows from empty via the factory", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input))

    form.setInput([1, 2])

    expect(form.getInput(monitor)).toStrictEqual([1, 2])
  })

  it("passes the slot index to the factory when growing past existing elements", () => {
    const factory = vi.fn((input: number, _index: number) => FormUnit(input))

    const form = FormList(factory, { input: [10, 20] })

    expect(factory).toHaveBeenCalledTimes(2)
    expect(factory).toHaveBeenNthCalledWith(1, 10, 0)
    expect(factory).toHaveBeenNthCalledWith(2, 20, 1)

    form.setInput([10, 20, 30, 40])

    expect(factory).toHaveBeenCalledTimes(4)
    expect(factory).toHaveBeenNthCalledWith(3, 30, 2)
    expect(factory).toHaveBeenNthCalledWith(4, 40, 3)
  })

  it("passes the slot index to the factory for removed-slot dirty checks", ({ monitor }) => {
    const factory = vi.fn((input: number, _index: number) => FormUnit(input))

    const form = FormList(factory, { initial: [10, 20, 30] })

    expect(factory).toHaveBeenCalledTimes(3)
    factory.mockClear()

    form.setInput([10])

    form.isDirty(monitor, identity)

    expect(factory).toHaveBeenCalledTimes(2)
    expect(factory).toHaveBeenNthCalledWith(1, 20, 1)
    expect(factory).toHaveBeenNthCalledWith(2, 30, 2)
  })
})

describe("setInitial auto-grow", () => {
  it("assigns initial without creating elements", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1],
    })

    form.setInitial([10, 20, 30])

    expect(form.getInitial(monitor)).toStrictEqual([10, 20, 30])
    expect(form.getInput(monitor)).toStrictEqual([1])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      10,
    ])
  })

  it("assigns initial after matching the input", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1],
    })

    form.setInput([1, 2, 3])
    form.setInitial([10, 20, 30])

    expect(form.getInitial(monitor)).toStrictEqual([10, 20, 30])
    expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      10, 20, 30,
    ])
  })

  it("assigns initial before matching the input", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1],
    })

    form.setInitial([10, 20, 30])
    form.setInput([1, 2, 3])

    expect(form.getInitial(monitor)).toStrictEqual([10, 20, 30])
    expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      10, 20, 30,
    ])
  })

  it("resets to assigned initials", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1],
    })

    form.setInitial([10, 20, 30])
    form.reset()

    expect(form.getInitial(monitor)).toStrictEqual([10, 20, 30])
    expect(form.getInput(monitor)).toStrictEqual([10, 20, 30])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      10, 20, 30,
    ])
    expect(form.getElements(monitor).map((element) => element.getInput(monitor))).toStrictEqual([
      10, 20, 30,
    ])
  })

  it("resets to assigned element initials", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      initial: [1, 2, 3],
    })

    form.getElements(monitor).at(1)?.setInitial(20)

    form.reset()

    expect(form.getInitial(monitor)).toStrictEqual([1, 20, 3])
    expect(form.getInput(monitor)).toStrictEqual([1, 20, 3])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      1, 20, 3,
    ])
    expect(form.getElements(monitor).map((element) => element.getInput(monitor))).toStrictEqual([
      1, 20, 3,
    ])
  })

  it("shrinks initials when setInitial is shorter", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), {
      input: [1, 2, 3],
    })

    form.setInitial([7, 8])

    expect(form.getInitial(monitor)).toStrictEqual([7, 8])
    expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      7, 8, 3,
    ])
  })
})

it("resets after setElements([]) via the factory", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
  })

  form.setElements([])
  expect(form.getElements(monitor)).toHaveLength(0)

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})

describe("nested factory behavior", () => {
  it("inner setInput grows inner elements", ({ monitor }) => {
    const form = FormList(
      (initial: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), { initial }),
      {
        initial: [[1, 2], [3]],
      },
    )

    form.getElements(monitor).at(0)?.setInput([10, 20, 30])

    expect(form.getInput(monitor)).toStrictEqual([[10, 20, 30], [3]])
  })

  it("outer reset rebuilds nested lists", ({ monitor }) => {
    const form = FormList(
      (initial: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), { initial }),
      {
        initial: [[1, 2], [3]],
      },
    )

    form.setInput([[100, 200], [300, 400], [500]])

    expect(form.getInput(monitor)).toStrictEqual([[100, 200], [300, 400], [500]])

    form.reset()
    expect(form.getInput(monitor)).toStrictEqual([[1, 2], [3]])
  })
})

describe("factory with FormShape elements", () => {
  it("unpacks the input in the factory and grows via setInput", ({ monitor }) => {
    interface Item {
      first: number
      second: string
    }

    const form = FormList(
      ({ first, second }: Item) =>
        FormShape({
          first: FormUnit(first),
          second: FormUnit(second),
        }),
      {
        initial: [
          { first: 1, second: "a" },
          { first: 2, second: "b" },
        ],
      },
    )

    expect(form.getInput(monitor)).toStrictEqual([
      { first: 1, second: "a" },
      { first: 2, second: "b" },
    ])

    form.setInput([
      { first: 10, second: "x" },
      { first: 20, second: "y" },
      { first: 30, second: "z" },
    ])

    expect(form.getInput(monitor)).toStrictEqual([
      { first: 10, second: "x" },
      { first: 20, second: "y" },
      { first: 30, second: "z" },
    ])
  })
})
