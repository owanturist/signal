import type { Setter } from "~/tools/setter"

import { FormList, FormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0],
  })

  expectTypeOf(form.setInput).toEqualTypeOf<
    (setter: Setter<ReadonlyArray<number>, [ReadonlyArray<number>, ReadonlyArray<number>]>) => void
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
})

it("passes the list in the transform function", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setInput((elements) => elements.map((x) => x + 1))
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})
