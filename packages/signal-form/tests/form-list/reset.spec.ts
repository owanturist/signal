import { z } from "zod"

import type { Setter } from "~/tools/setter"

import { FormList, FormUnit } from "../../src"
import { wait } from "../common"

beforeAll(() => {
  vi.useFakeTimers()
})

it("matches the type definition", ({ monitor }) => {
  const form = FormList(
    (input: number) =>
      FormUnit(input, {
        schema: z.number().transform((x) => x.toFixed(0)),
      }),
    { initial: [0] },
  )

  expectTypeOf(form.reset).toEqualTypeOf<
    (
      resetter?: Setter<ReadonlyArray<number>, [ReadonlyArray<number>, ReadonlyArray<number>]>,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.reset).toEqualTypeOf<
    (resetter?: Setter<number, [number, number]>) => void
  >()
})

it("sets initial values for all items", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.reset()
  expect(form.getOutput(monitor)).toStrictEqual([1, 2, 3])
})

it("clears custom errors", ({ monitor }) => {
  const form = FormList<FormUnit<number, ReadonlyArray<string>>>(
    (input: number) => FormUnit<number, ReadonlyArray<string>>(input),
    {
      initial: [0, 1, 2],
      error: [["error"], ["error"], ["error"]],
    },
  )

  form.reset()
  expect(form.getError(monitor)).toBeNull()
})

it("resets isValidated state", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input, { schema: z.number() }), {
    initial: [0, 1, 2],
  })

  form.setTouched(true)
  expect(form.isValidated(monitor)).toBe(true)

  form.reset()
  expect(form.isValidated(monitor)).toBe(false)
})

it("provides the initial value to the element resetter 1st argument", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.reset((initial) => initial.map((x) => x + 1))
  expect(form.getOutput(monitor)).toStrictEqual([2, 3, 4])
})

it("provides the original value to the resetter 2nd argument", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.reset((_, original) => original.map((x) => x + 1))
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
})

it("restores removed elements", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.setElements((elements) => elements.slice(0, 2))
  expect(form.getInput(monitor)).toStrictEqual([0, 1])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
})

it("restores all elements", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.setElements([])
  expect(form.getInput(monitor)).toStrictEqual([])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
})

it("removes added element", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
    input: [0, 1, 2],
  })

  form.setElements((elements) => [...elements, FormUnit(3, { initial: 4 })])
  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
})

it("removes all elements", ({ monitor }) => {
  const form = FormList<FormUnit<number>>((input: number) => FormUnit(input), {
    initial: [],
  })

  form.setElements([
    FormUnit(0, { initial: 1 }),
    FormUnit(1, { initial: 2 }),
    FormUnit(2, { initial: 3 }),
  ])
  expect(form.getInput(monitor)).toStrictEqual([0, 1, 2])
  expect(form.getInitial(monitor)).toStrictEqual([])

  form.reset()
  expect(form.getInput(monitor)).toStrictEqual([])
  expect(form.getInitial(monitor)).toStrictEqual([])
})

/**
 * @link https://github.com/owanturist/signal/issues/872
 */
it.fails("resets validateOn for restored elements to the factory default", ({ monitor }) => {
  const form = FormList(
    (input: number) => FormUnit(input, { schema: z.number(), validateOn: "onChange" }),
    {
      initial: [0, 1, 2],
    },
  )

  form.setElements([FormUnit(0, { schema: z.number() })])
  form.setValidateOn("onInit")
  expect(form.getValidateOn(monitor)).toBe("onInit")

  form.reset()
  expect(form.getValidateOn(monitor)).toBe("onInit")
})

it("updates submit count for restored elements", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.setElements([FormUnit(0)])
  form.submit()
  expect(form.getSubmitCount(monitor)).toBe(1)
  expect(form.getElements(monitor).map((element) => element.getSubmitCount(monitor))).toStrictEqual(
    [1],
  )

  form.reset()
  expect(form.getSubmitCount(monitor)).toBe(1)
  expect(form.getElements(monitor).map((element) => element.getSubmitCount(monitor))).toStrictEqual(
    [1, 1, 1],
  )
})

it("updates isSubmitting for restored elements", async ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [0, 1, 2],
  })

  form.onSubmit(() => wait(1000))

  form.setElements([FormUnit(0)])
  form.submit()
  expect(form.isSubmitting(monitor)).toBe(true)
  expect(form.getElements(monitor).map((element) => element.isSubmitting(monitor))).toStrictEqual([
    true,
  ])

  form.reset()
  expect(form.isSubmitting(monitor)).toBe(true)
  expect(form.getElements(monitor).map((element) => element.isSubmitting(monitor))).toStrictEqual([
    true,
    true,
    true,
  ])

  await vi.advanceTimersByTimeAsync(1000)
  expect(form.isSubmitting(monitor)).toBe(false)
  expect(form.getElements(monitor).map((element) => element.isSubmitting(monitor))).toStrictEqual([
    false,
    false,
    false,
  ])
})
