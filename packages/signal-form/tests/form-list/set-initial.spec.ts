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
    (setter: Setter<ReadonlyArray<number>, [ReadonlyArray<number>, ReadonlyArray<number>]>) => void
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
        ReadonlyArray<ReadonlyArray<number>>,
        [ReadonlyArray<ReadonlyArray<number>>, ReadonlyArray<ReadonlyArray<number>>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setInitial).toEqualTypeOf<
    (setter: Setter<ReadonlyArray<number>, [ReadonlyArray<number>, ReadonlyArray<number>]>) => void
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

  it.todo("does NOT override list initial when splicing a new element with its own initial", ({
    monitor,
  }) => {
    console.log("TODO NOW verify with old version")
    const form = FormList((input) => setupElement(input), {
      initial: [
        { first: 1, second: "1" },
        { first: 2, second: "2" },
      ],
    })

    form.setElements((elements) => [
      setupElement(),
      FormShape({
        first: FormUnit(0, { initial: 20 }),
        second: FormUnit("", { initial: "20" }),
      }),
      ...elements,
    ])

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
