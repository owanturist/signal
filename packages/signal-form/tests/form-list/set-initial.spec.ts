import type { Setter } from "~/tools/setter"

import { FormList, FormShape, type FormShapeOptions, FormUnit } from "../../src"

interface Element {
  first: FormUnit<number>
  second: FormUnit<string>
}

function setupElement(options?: FormShapeOptions<Element>) {
  return FormShape(
    {
      first: FormUnit(0),
      second: FormUnit("0"),
    },
    options,
  )
}

it("matches the type definition", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0],
  })

  expectTypeOf(form.setInitial).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<Setter<number, [number, number]>>,
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
    (initial: ReadonlyArray<number>) =>
      FormList((innerInput: number) => FormUnit(innerInput), { initial }),
    {
      initial: [[0]],
    },
  )

  expectTypeOf(form.setInitial).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<
          Setter<
            ReadonlyArray<Setter<number, [number, number]>>,
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
        ReadonlyArray<Setter<number, [number, number]>>,
        [ReadonlyArray<number>, ReadonlyArray<number>]
      >,
    ) => void
  >()

  expectTypeOf(
    form.getElements(monitor).at(0)!.getElements(monitor).at(0)!.setInitial,
  ).toEqualTypeOf<(setter: Setter<number, [number, number]>) => void>()
})

it("changes all items", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInitial([3, 4, 5])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4, 5])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 4, 5,
  ])
})

it("adds an added element's initial", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1],
  })

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
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1],
  })

  form.setElements((elements) => elements.slice(0, 1))
  expect(form.getOutput(monitor)).toStrictEqual([0])

  expect(form.getInitial(monitor)).toStrictEqual([0, 1])
  form.setInitial([3, 4])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([3])
})

it("adds initial when neither initial nor current value exist", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1],
  })

  form.setInitial([3, 4, 5])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4, 5])

  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 4,
  ])
})

it("removes initials by shorter list", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.setInitial([3, 4])
  expect(form.getInitial(monitor)).toStrictEqual([3, 4])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    3, 4, 3,
  ])
})

it("remove all initials by empty list", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.setInitial([])
  expect(form.getInitial(monitor)).toStrictEqual([])
  expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    1, 2, 3,
  ])
})

it("updates list's initial value from an element's setInitial", ({ monitor }) => {
  const form = FormList((input) => setupElement(input), {
    initial: [
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ],
  })

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

it("passes an element in the transform function", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInitial([10, (x) => x + 3])
  expect(form.getInitial(monitor)).toStrictEqual([10, 4])
})

it("passes an element in the list transform function", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInitial((elements) => elements.map(() => (x) => x + 1))
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
})

describe("adding a new element to the list's beginning", () => {
  it("keeps initial values for an initial element", ({ monitor }) => {
    const form = FormList((input) => setupElement(input), {
      initial: [{ first: 1, second: "1" }],
    })

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.getInitial(monitor)).toStrictEqual([{ first: 1, second: "1" }])

    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])
  })

  it("inherits initial value for a new element by default", ({ monitor }) => {
    const form = FormList((input) => setupElement(input), {
      initial: [{ first: 1, second: "1" }],
    })

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.getInitial(monitor)).toStrictEqual([{ first: 1, second: "1" }])

    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 1, second: "1" },
    ])
  })

  it("overrides initial value for a list by a new element", ({ monitor }) => {
    const form = FormList((input) => setupElement(input), {
      initial: [
        { first: 1, second: "1" },
        { first: 2, second: "2" },
      ],
    })

    form.setElements((elements) => [
      setupElement({
        input: { first: 0, second: "0" },
        initial: { first: 10, second: "10" },
      }),
      FormShape({
        first: FormUnit(0, { initial: 20 }),
        second: FormUnit("", { initial: "20" }),
      }),
      ...elements,
    ])

    expect(form.getInitial(monitor)).toStrictEqual([
      { first: 10, second: "10" },
      { first: 20, second: "20" },
    ])

    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 10, second: "10" },
      { first: 20, second: "20" },
      { first: 1, second: "1" },
      { first: 2, second: "2" },
    ])
  })

  it("updates list's initial value from an element's setInitial", ({ monitor }) => {
    const form = FormList((input) => setupElement(input), {
      initial: [
        { first: 1, second: "1" },
        { first: 2, second: "2" },
      ],
    })

    form.setElements((elements) => [setupElement(), ...elements])

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

  it("keeps an explicit-initial leaf intact through the list's setElements patch", ({
    monitor,
  }) => {
    const form = FormList((input: number) => FormUnit(input), {
      initial: [1, 2],
    })

    form.setElements((elements) => [FormUnit(0, { initial: 99 }), ...elements])

    // Position 0: new element is patched with initialInputs[0]=1 → its explicit
    //   leaf rejects the patch and stays at 99.
    // Position 1: existing e0 is force-set to initialInputs[1]=2 (existing
    //   children always adopt the new positional initial via _setInitial).
    // Position 2: e1 is past initialInputs.length and is left alone.
    expect(form.getInitial(monitor)).toStrictEqual([99, 2])
    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      99, 2, 2,
    ])
  })

  it("preserves explicit leaves inside a nested-list element on outer prepend", ({ monitor }) => {
    const form = FormList(
      (initial: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), { initial }),
      {
        initial: [[1, 2]],
      },
    )

    // Outer list has _initialInputs = [[1, 2]]. Prepend an inner list whose
    // leaves are explicit at the FormUnit factory level.
    form.setElements((elements) => [
      FormList((n: number) => FormUnit(n, { initial: n }), { input: [9, 8] }),
      ...elements,
    ])

    // Outer patch reaches the inner list's leaves; explicit leaves no-op.
    expect(
      form
        .getElements(monitor)
        .at(0)!
        .getElements(monitor)
        .map((u) => u.getInitial(monitor)),
    ).toStrictEqual([9, 8])
  })

  it("patches some shape fields while leaving the explicit one alone", ({ monitor }) => {
    const form = FormList((input) => setupElement(input), {
      initial: [{ first: 1, second: "1" }],
    })

    form.setElements((elements) => [
      FormShape({
        first: FormUnit(0, { initial: 42 }),
        second: FormUnit("0"),
      }),
      ...elements,
    ])

    // first stays explicit at 42; second gets patched from _initialInputs[0].second.
    expect(form.getElements(monitor).at(0)!.getInitial(monitor)).toStrictEqual({
      first: 42,
      second: "1",
    })
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
            { initial: input.first },
          ),
        }),
      {
        initial: [{ first: [{ one: "1", two: 2 }] }],
      },
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
        (initial: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), { initial }),
        {
          initial: [[1, 2]],
        },
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
        (initial: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), { initial }),
        {
          initial: [[1, 2]],
        },
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
        (initial: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), { initial }),
        {
          initial: [[1, 2]],
        },
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
