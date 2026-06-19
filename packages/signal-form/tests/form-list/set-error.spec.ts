import type { Setter } from "~/tools/setter"

import { FormList, FormUnit } from "../../src"

function makeUnit(input: number) {
  return FormUnit<number, ReadonlyArray<string>>(input)
}

it("matches the type definition", ({ monitor }) => {
  const form = FormList(
    (input: number) =>
      FormUnit(input, {
        validate: (value) => (value === 0 ? ["fail", null] : [null, value]),
      }),
    {
      initial: [0],
    },
  )

  expectTypeOf(form.setError).toEqualTypeOf<
    (
      setter: Setter<
        null | ReadonlyArray<undefined | Setter<null | string>>,
        [ReadonlyArray<null | string>]
      >,
    ) => void
  >()

  expectTypeOf(form.getElements(monitor).at(0)!.setError).toEqualTypeOf<
    (setter: Setter<null | string>) => void
  >()
})

it("resets all errors with null", ({ monitor }) => {
  const form = FormList<FormUnit<number, ReadonlyArray<string>>>(makeUnit, {
    initial: [0, 1, 2],
    error: [["err0"], ["err1"], ["err2"]],
  })

  form.setError(null)
  expect(form.getError(monitor)).toBeNull()
})

it("changes all errors", ({ monitor }) => {
  const form = FormList<FormUnit<number, ReadonlyArray<string>>>(makeUnit, {
    initial: [0, 1, 2],
    error: [["err0"], ["err1"], ["err2"]],
  })

  form.setError([["e0"], ["e1"], null])
  expect(form.getError(monitor)).toStrictEqual([["e0"], ["e1"], null])
})

it("changes some errors", ({ monitor }) => {
  const form = FormList<FormUnit<number, ReadonlyArray<string>>>(makeUnit, {
    initial: [0, 1, 2],
    error: [["err0"], ["err1"], ["err2"]],
  })

  form.setError([(x) => [...x!, "x"], undefined, (x) => [...x!, "x"]])
  expect(form.getError(monitor)).toStrictEqual([["err0", "x"], ["err1"], ["err2", "x"]])
})
