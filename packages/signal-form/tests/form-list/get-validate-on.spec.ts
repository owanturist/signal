import type { Monitor } from "@owanturist/signal"
import { z } from "zod"

import { params } from "~/tools/params"

import {
  FormList,
  type FormListOptions,
  FormUnit,
  type FormUnitSchemaOptions,
  type ValidateStrategy,
} from "../../src"

type Element = FormUnit<number, ReadonlyArray<string>>

function setup(initialInputs: ReadonlyArray<number>, options?: FormListOptions<Element>) {
  return FormList<Element>((input: number) => setupElement(input), initialInputs, options)
}

function setupElement(initial: number, options?: Partial<FormUnitSchemaOptions<number>>) {
  return FormUnit(initial, {
    schema: z.number(),
    ...options,
  })
}

it("matches the type definition", ({ monitor }) => {
  const form = setup([0])

  expectTypeOf(form.getValidateOn).toEqualTypeOf<{
    (monitor: Monitor): ValidateStrategy | ReadonlyArray<ValidateStrategy>

    <TResult>(
      monitor: Monitor,
      select: (
        concise: ValidateStrategy | ReadonlyArray<ValidateStrategy>,
        verbose: ReadonlyArray<ValidateStrategy>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(monitor).at(0)!.getValidateOn).toEqualTypeOf<{
    (monitor: Monitor): ValidateStrategy

    <TResult>(
      monitor: Monitor,
      select: (concise: ValidateStrategy, verbose: ValidateStrategy) => TResult,
    ): TResult
  }>()
})

it("returns 'onTouch' for empty list", ({ monitor }) => {
  const form = setup([])

  expect(form.getValidateOn(monitor)).toBe("onTouch")
  expect(form.getValidateOn(monitor, params._first)).toBe("onTouch")
  expect(form.getValidateOn(monitor, params._second)).toStrictEqual([])
})

it("returns verbose when elements use more than a single strategy", ({ monitor }) => {
  const form = setup([0, 1, 2], { validateOn: ["onInit", undefined, "onSubmit"] })

  const expected = ["onInit", "onTouch", "onSubmit"]

  expect(form.getValidateOn(monitor)).toStrictEqual(expected)
  expect(form.getValidateOn(monitor, params._first)).toStrictEqual(expected)
  expect(form.getValidateOn(monitor, params._second)).toStrictEqual(expected)
})

it("returns concise when all elements use the same strategy", ({ monitor }) => {
  const form = setup([0, 1, 2], { validateOn: "onChange" })

  expect(form.getValidateOn(monitor)).toBe("onChange")
  expect(form.getValidateOn(monitor, params._first)).toBe("onChange")
  expect(form.getValidateOn(monitor, params._second)).toStrictEqual([
    "onChange",
    "onChange",
    "onChange",
  ])
})
