import { FormList, FormShape, FormUnit } from "../../src"

describe("setInput auto-grow", () => {
  it("grows the list via the factory when setInput is longer than current", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), [1])

    form.setInput([10, 20, 30])

    expect(form.getInput(monitor)).toStrictEqual([10, 20, 30])
    expect(form.getElements(monitor)).toHaveLength(3)
  })

  it("truncates the list when setInput is shorter than current", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), [1, 2, 3])

    form.setInput([9])

    expect(form.getInput(monitor)).toStrictEqual([9])
    expect(form.getElements(monitor)).toHaveLength(1)
  })

  it("grows from empty via the factory", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), [])

    form.setInput([1, 2])

    expect(form.getInput(monitor)).toStrictEqual([1, 2])
  })

  it("throws when a function setter targets a new slot with no seed", () => {
    const form = FormList((input: number) => FormUnit(input), [])

    expect(() => form.setInput([(x) => x + 1])).toThrow(/function setter at index 0/)
  })

  it("silently skips undefined setters at new slots with no seed", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), [])

    form.setInput([undefined, 20])

    // index 0: undefined + no seed → skipped; index 1: value → factory(20, 1)
    expect(form.getInput(monitor)).toStrictEqual([20])
  })
})

describe("setInitial auto-grow", () => {
  it("caps initialInputs growth at max(elements.length, currentInitialInputs.length)", ({
    monitor,
  }) => {
    // setInitial does not invoke the factory to materialize a new element — it only
    // writes initial values for slots that already have an element OR an existing
    // initial. Slots beyond both are silently dropped.
    const form = FormList((input: number) => FormUnit(input), [1])

    form.setInitial([10, 20, 30])

    expect(form.getInitial(monitor)).toStrictEqual([10])
    expect(form.getElements(monitor).map((e) => e.getInitial(monitor))).toStrictEqual([10])
  })

  it("can grow initialInputs after setInput grew elements", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), [1])

    form.setInput([0, 0, 0]) // elements grow to length 3
    form.setInitial([10, 20, 30]) // now initialInputs can grow alongside

    expect(form.getInitial(monitor)).toStrictEqual([10, 20, 30])
  })

  it("shrinks initialInputs when setInitial is shorter", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), [1, 2, 3])

    form.setInitial([7, 8])

    expect(form.getInitial(monitor)).toStrictEqual([7, 8])
  })
})

describe("reset uses the factory to rebuild", () => {
  it("recreates fresh elements from initialInputs", ({ monitor }) => {
    let factoryCalls = 0
    const form = FormList(
      (input: number) => {
        factoryCalls++
        return FormUnit(input)
      },
      [1, 2, 3],
    )

    const beforeReset = factoryCalls
    expect(beforeReset).toBe(3)

    form.setInput([10, 20, 30, 40, 50])
    expect(factoryCalls).toBe(5) // 2 new elements built by factory

    form.reset()
    expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
    expect(form.getElements(monitor)).toHaveLength(3)
    expect(factoryCalls).toBe(8) // 3 more for reset
  })

  it("rebuilds after setElements([]) via the factory", ({ monitor }) => {
    const form = FormList((input: number) => FormUnit(input), [1, 2, 3])

    form.setElements([])
    expect(form.getElements(monitor)).toHaveLength(0)

    form.reset()
    expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  })
})

describe("nested factory behavior", () => {
  it("inner setInput grows inner elements", ({ monitor }) => {
    const form = FormList(
      (input: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), input),
      [[1, 2], [3]],
    )

    form.getElements(monitor).at(0)!.setInput([10, 20, 30])

    expect(form.getInput(monitor)).toStrictEqual([[10, 20, 30], [3]])
  })

  it("outer reset rebuilds nested lists", ({ monitor }) => {
    const form = FormList(
      (input: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), input),
      [[1, 2], [3]],
    )

    form.getElements(monitor).at(0)!.setInput([99, 88, 77, 66])
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
      ({ first, second }: Item) => FormShape({ first: FormUnit(first), second: FormUnit(second) }),
      [
        { first: 1, second: "a" },
        { first: 2, second: "b" },
      ],
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
