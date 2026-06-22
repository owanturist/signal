import type { Setter } from "~/tools/setter"

import { FormList, FormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0],
  })

  expectTypeOf(form.setInput).toEqualTypeOf<
    (
      setter: Setter<
        ReadonlyArray<Setter<number, [number, number]>>,
        [ReadonlyArray<number>, ReadonlyArray<number>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setInput).toEqualTypeOf<
    (setter: Setter<number, [number, number]>) => void
  >()
})

it("changes all items", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInput([3, 4, 5])
  expect(form.getInput(monitor)).toStrictEqual([3, 4, 5])
})

it("truncates the list when setting a shorter array", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInput([])
  expect(form.getInput(monitor)).toStrictEqual([])
})

it("grows the list via the factory when setting a longer array", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [],
  })

  form.setInput([0, 1])
  expect(form.getInput(monitor)).toStrictEqual([0, 1])
})

it("extends the list via the factory", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInput([3, 4, 5, 6])
  expect(form.getInput(monitor)).toStrictEqual([3, 4, 5, 6])
  expect(form.getElements(monitor)).toHaveLength(4)
})

it("passes the list in the transform function", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInput((elements) => elements.map((x) => x + 1))
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})

it("passes an element in the transform function", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInput([10, (x) => x + 3])
  expect(form.getInput(monitor)).toStrictEqual([10, 4])
})

it("passes an element in the list transform function", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInput((elements) => elements.map(() => (x) => x + 1))
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})

it("preserves inner list's getInitial after remove + re-add via outer setInput", ({ monitor }) => {
  const outer = FormList(
    (input: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), { input }),
    { initial: [[1, 2, 3]] },
  )

  outer.setInput([])
  outer.setInput([[1, 2, 3]])

  const inner = outer.getElements(monitor).at(0)!

  // Each leaf has the patched initial.
  expect(inner.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
    1, 2, 3,
  ])

  // But the inner list's own getInitial reads from the stale (empty) _initialInputs.
  expect(inner.getInitial(monitor)).toStrictEqual([1, 2, 3])
})
