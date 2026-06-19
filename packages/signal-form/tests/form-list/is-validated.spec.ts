import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { params } from "~/tools/params"

import { FormList, type FormListOptions, FormUnit } from "../../src"

type Element = FormUnit<number, ReadonlyArray<string>>

function setup(options?: FormListOptions<Element>) {
  return FormList<Element>((input: number) => FormUnit(input, { schema: z.number() }), options)
}

it("matches the type definition", ({ monitor }) => {
  const form = setup({
    initial: [0],
  })

  expectTypeOf(form.isValidated).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(
      monitor: Monitor,
      select: (
        concise: boolean | ReadonlyArray<boolean>,
        verbose: ReadonlyArray<boolean>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(monitor).at(0)!.isValidated).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(monitor: Monitor, select: (concise: boolean, verbose: boolean) => TResult): TResult
  }>()
})

it("returns false for empty list", ({ monitor }) => {
  const form = setup({
    initial: [],
  })

  expect(form.isValidated(monitor)).toBe(false)
  expect(form.isValidated(monitor, params._first)).toBe(false)
  expect(form.isValidated(monitor, params._second)).toStrictEqual([])
})

it("returns false when all elements are not validated", ({ monitor }) => {
  const form = setup({
    initial: [0, 1, 2],
  })

  expect(form.isValidated(monitor)).toBe(false)
  expect(form.isValidated(monitor, params._first)).toBe(false)
  expect(form.isValidated(monitor, params._second)).toStrictEqual([false, false, false])
})

it("returns false when at least one element is not validated", ({ monitor }) => {
  const form = setup({
    initial: [0, 1, 2],
    validateOn: ["onInit", "onInit"],
  })

  expect(form.isValidated(monitor)).toBe(false)
  expect(form.isValidated(monitor, params._first)).toStrictEqual([true, true, false])
  expect(form.isValidated(monitor, params._second)).toStrictEqual([true, true, false])
})

it("returns true when all elements are validated", ({ monitor }) => {
  const form = setup({
    initial: [0, 1, 2],
    validateOn: "onInit",
  })

  expect(form.isValidated(monitor)).toBe(true)
  expect(form.isValidated(monitor, params._first)).toBe(true)
  expect(form.isValidated(monitor, params._second)).toStrictEqual([true, true, true])
})

it("returns false when at least one element has custom errors", ({ monitor }) => {
  const form = setup({
    initial: [0, 1, 2],
    error: [["error"]],
  })

  expect(form.isValidated(monitor)).toBe(false)
  expect(form.isValidated(monitor, params._first)).toStrictEqual([true, false, false])
  expect(form.isValidated(monitor, params._second)).toStrictEqual([true, false, false])
})
