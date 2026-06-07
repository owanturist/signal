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

  expectTypeOf(form.getInput).toEqualTypeOf<(monitor: Monitor) => ReadonlyArray<number>>()

  expectTypeOf(form.getElements(monitor).at(0)!.getInput).toEqualTypeOf<
    (monitor: Monitor) => number
  >()
})

it("returns empty array for empty list", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [])

  expect(form.getInput(monitor)).toStrictEqual([])
})

it("returns an array of original values", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), [0, 1, 2])

  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2])
})
