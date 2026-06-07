import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { FormList, FormUnit } from "../../src"

it("matches the type definition", ({ monitor }) => {
  const form = FormList(
    (input: number) =>
      FormUnit(input, {
        schema: z.number().transform((x) => x.toFixed(0)),
      }),
    [0],
  )

  expect(form.getElements(monitor)).toHaveLength(1)

  expectTypeOf(form.getInitial).toEqualTypeOf<(monitor: Monitor) => ReadonlyArray<number>>()

  expectTypeOf(form.getElements(monitor).at(0)!.getInitial).toEqualTypeOf<
    (monitor: Monitor) => number
  >()
})

it("matches the nested type definition", ({ monitor }) => {
  const form = FormList(
    (input: ReadonlyArray<number>) =>
      FormList<FormUnit<number, ReadonlyArray<string>, string>>(
        (innerInput) =>
          FormUnit(innerInput, {
            schema: z.number().transform((x) => x.toFixed(0)),
          }),
        input,
      ),
    [[0]],
  )

  expect(form.getElements(monitor)).toHaveLength(1)

  expectTypeOf(form.getInitial).toEqualTypeOf<
    (monitor: Monitor) => ReadonlyArray<ReadonlyArray<number>>
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.getInitial).toEqualTypeOf<
    (monitor: Monitor) => ReadonlyArray<number>
  >()

  expectTypeOf(
    form.getElements(monitor).at(0)!.getElements(monitor).at(0)!.getInitial,
  ).toEqualTypeOf<(monitor: Monitor) => number>()
})

it("returns empty array for empty list", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [])

  expect(form.getInitial(monitor)).toStrictEqual([])
})

it("returns an array of original values", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [3, 1, 4])

  expect(form.getInitial(monitor)).toStrictEqual([3, 1, 4])
})

it("returns nested list's values", ({ monitor }) => {
  const form = FormList(
    (input: ReadonlyArray<number>) => FormList((n: number) => FormUnit(n), input),
    [[1], [2, 3]],
  )

  expect(form.getInitial(monitor)).toStrictEqual([[1], [2, 3]])
})
