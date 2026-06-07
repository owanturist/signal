import type { Setter } from "~/tools/setter"

import {
  FormList,
  type FormListOptions,
  FormShape,
  type FormShapeOptions,
  FormUnit,
  type SignalForm,
} from "../../src"

interface Element {
  first: FormUnit<number>
  second: FormUnit<string>
}

interface ElementInput {
  first: number
  second: string
}

function setup<T extends SignalForm>(
  factory: (input: T extends SignalForm<infer P> ? P["input.schema"] : never, index: number) => T,
  initialInputs: ReadonlyArray<T extends SignalForm<infer P> ? P["input.schema"] : never>,
  options?: FormListOptions<T>,
) {
  return FormList(factory, initialInputs, options)
}

function setupElement(input: ElementInput, options?: FormShapeOptions<Element>) {
  return FormShape(
    {
      first: FormUnit(input.first),
      second: FormUnit(input.second),
    },
    options,
  )
}

it("matches the type definition", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [0])

  expectTypeOf(form.setInitial).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<undefined | Setter<number, [number, number]>>,
        [ReadonlyArray<number>, ReadonlyArray<number>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setInitial).toEqualTypeOf<
    (setter: Setter<number, [number, number]>) => void
  >()
})

it("matches the nested type definition", ({ monitor }) => {
  const form = FormList(
    (input: ReadonlyArray<number>) => FormList((innerInput: number) => FormUnit(innerInput), input),
    [[0]],
  )

  expectTypeOf(form.setInitial).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<
          | undefined
          | Setter<
              ReadonlyArray<undefined | Setter<number, [number, number]>>,
              [ReadonlyArray<number>, ReadonlyArray<number>]
            >
        >,
        [ReadonlyArray<ReadonlyArray<number>>, ReadonlyArray<ReadonlyArray<number>>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setInitial).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<undefined | Setter<number, [number, number]>>,
        [ReadonlyArray<number>, ReadonlyArray<number>]
      >,
    ) => void
  >()

  expectTypeOf(
    form.getElements(monitor).at(0)!.getElements(monitor).at(0)!.setInitial,
  ).toEqualTypeOf<(setter: Setter<number, [number, number]>) => void>()
})

it("changes all items", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [0, 1, 2])

  form.setInitial([3, 4, 5])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4, 5])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 4, 5,
  ])
})

it("adds an added element's initial", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [0, 1])

  form.setElements((elements) => [...elements, FormUnit(2)])

  expect(form.getInitial(monitor)).toStrictEqual([0, 1])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    0, 1, 2,
  ])

  form.setInitial([3, 4, 5])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4, 5])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 4, 5,
  ])
})

it("keeps a removed element's initial", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [0, 1])

  form.setElements((elements) => elements.slice(0, 1))
  expect(form.getOutput(monitor)).toStrictEqual([0])

  expect(form.getInitial(monitor)).toStrictEqual([0, 1])
  form.setInitial([3, 4])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([3])
})

it("does not add initial when neither initial nor current value exist", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [0, 1])

  form.setInitial([3, 4, 5])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4])

  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 4,
  ])
})

it("removes initials by shorter list", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [1, 2, 3], { input: [0, 1, 2] })

  form.setInitial([3, 4])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 4, 3,
  ])
})

it('do not remove initials by "undefined" in the list', ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [1, 2, 3], { input: [0, 1, 2] })

  form.setInitial([undefined, 4, undefined])
  expect(form.getInitial(monitor)).toStrictEqual([1, 4, 3])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    1, 4, 3,
  ])
})

it("remove all initials by empty list", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [1, 2, 3], { input: [0, 1, 2] })

  form.setInitial([])
  expect(form.getInitial(monitor)).toStrictEqual([])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    1, 2, 3,
  ])
})

it("overrides initial values on init", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [1, 2, 3], {
    input: [0, 1, 2],
    initial: [4, 5, 6],
  })

  expect(form.getInitial(monitor)).toStrictEqual([4, 5, 6])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    4, 5, 6,
  ])
})

it("changed list's initial values when element's initial is changed", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [0, 1, 2], {
    initial: [3, 4, 5],
  })

  form.getElements(monitor).at(1)!.setInitial(6)
  expect(form.getInitial(monitor)).toStrictEqual([3, 6, 5])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 6, 5,
  ])
})

it("updates list's initial value from an element's setInitial", ({ monitor }) => {
  const form = setup<FormShape<Element>>(
    (input) => setupElement(input),
    [
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ],
  )

  expect(form.getInitial(monitor)).toStrictEqual([
    { first: 1, second: "1" },
    { first: 2, second: "2" },
  ])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    { first: 1, second: "1" },
    { first: 2, second: "2" },
  ])

  form.getElements(monitor).at(1)!.setInitial({ first: 3, second: "3" })

  expect(form.getInitial(monitor)).toStrictEqual([
    { first: 1, second: "1" },
    { first: 3, second: "3" },
  ])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    { first: 1, second: "1" },
    { first: 3, second: "3" },
  ])
})

describe("adding a new element to the list's beginning", () => {
  it("keeps initial values for an initial element", ({ monitor }) => {
    const form = setup<FormShape<Element>>(
      (input) => setupElement(input),
      [{ first: 1, second: "1" }],
    )

    form.setElements((elements) => [
      setupElement({ first: 0, second: "0" }, { input: { first: 0, second: "0" } }),
      ...elements,
    ])

    expect(form.getInitial(monitor)).toStrictEqual([{ first: 1, second: "1" }])

    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])
  })

  it("inherits initial value for a new element by default", ({ monitor }) => {
    const form = setup<FormShape<Element>>(
      (input) => setupElement(input),
      [{ first: 1, second: "1" }],
    )

    form.setElements((elements) => [
      setupElement({ first: 0, second: "0" }, { input: { first: 0, second: "0" } }),
      ...elements,
    ])

    expect(form.getInitial(monitor)).toStrictEqual([{ first: 1, second: "1" }])

    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])
  })

  // Behavior change in factory-based FormList: setElements no longer grows _initialInputs.
  // The slot's initial wins; new elements' own `initial` option is overwritten by
  // initialInputs[i] for i < initialInputs.length, and ignored at the list level for i >= initialInputs.length.
  it("does NOT override list initial when splicing a new element with its own initial", ({
    monitor,
  }) => {
    const form = setup<FormShape<Element>>(
      (input) => setupElement(input),
      [
        { first: 1, second: "1" },
        { first: 2, second: "2" },
      ],
    )

    form.setElements((elements) => [
      setupElement(
        { first: 0, second: "0" },
        { input: { first: 0, second: "0" }, initial: { first: 10, second: "10" } },
      ),
      FormShape({
        first: FormUnit(0, { initial: 20 }),
        second: FormUnit("", { initial: "20" }),
      }),
      ...elements,
    ])

    // Slot 0 and 1 take initialInputs from the list (unchanged); slots 2 and 3 are beyond the
    // initialInputs length and keep their own.
    expect(form.getInitial(monitor)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])

    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])
  })

  it("updates list's initial value from an element's setInitial", ({ monitor }) => {
    const form = setup<FormShape<Element>>(
      (input) => setupElement(input),
      [
        { first: 1, second: "1" },
        { first: 2, second: "2" },
      ],
    )

    form.setElements((elements) => [
      setupElement({ first: 0, second: "0" }, { input: { first: 0, second: "0" } }),
      ...elements,
    ])

    expect(form.getInitial(monitor)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
      { first: 2, second: "2" },
    ])

    form.getElements(monitor).at(1)!.setInitial({ first: 3, second: "3" })

    expect(form.getInitial(monitor)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 3, second: "3" },
    ])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 3, second: "3" },
      { first: 2, second: "2" },
    ])
  })
})

describe("nested list", () => {
  it("returns initial value", ({ monitor }) => {
    const form = FormList(
      (input: { first: ReadonlyArray<{ one: string; two: number }> }) =>
        FormShape({
          first: FormList(
            (inner: { one: string; two: number }) =>
              FormShape({
                one: FormUnit(inner.one),
                two: FormUnit(inner.two),
              }),
            input.first,
          ),
        }),
      [{ first: [{ one: "1", two: 2 }] }],
    )

    expect(form.getInitial(monitor)).toStrictEqual([
      {
        first: [{ one: "1", two: 2 }],
      },
    ])
  })

  describe("when updating initial value from different entry points", () => {
    it("root level", ({ monitor }) => {
      const form = FormList(
        (input: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), input),
        [[1, 2]],
      )

      form.setInitial([[10, 2]])

      expect(form.getInitial(monitor)).toStrictEqual([[10, 2]])
      expect(form.getElements(monitor).map((list) => list.getInitial(monitor))).toStrictEqual([
        [10, 2],
      ])
      expect(
        form
          .getElements(monitor)
          .map((list) => list.getElements(monitor).map((unit) => unit.getInitial(monitor))),
      ).toStrictEqual([[10, 2]])
    })

    it("middle level", ({ monitor }) => {
      const form = FormList(
        (input: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), input),
        [[1, 2]],
      )

      form.getElements(monitor).at(0)!.setInitial([10, 2])

      expect(form.getInitial(monitor)).toStrictEqual([[10, 2]])
      expect(form.getElements(monitor).map((list) => list.getInitial(monitor))).toStrictEqual([
        [10, 2],
      ])
      expect(
        form
          .getElements(monitor)
          .map((list) => list.getElements(monitor).map((unit) => unit.getInitial(monitor))),
      ).toStrictEqual([[10, 2]])
    })

    it("bottom level", ({ monitor }) => {
      const form = FormList(
        (input: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), input),
        [[1, 2]],
      )

      form.getElements(monitor).at(0)!.getElements(monitor).at(0)!.setInitial(10)

      expect(form.getInitial(monitor)).toStrictEqual([[10, 2]])
      expect(form.getElements(monitor).map((list) => list.getInitial(monitor))).toStrictEqual([
        [10, 2],
      ])
      expect(
        form
          .getElements(monitor)
          .map((list) => list.getElements(monitor).map((unit) => unit.getInitial(monitor))),
      ).toStrictEqual([[10, 2]])
    })
  })
})
