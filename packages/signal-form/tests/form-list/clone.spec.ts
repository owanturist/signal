import { FormList, FormShape, FormUnit } from "../../src"

it("preserves the list's _initialInputs on the clone", ({ monitor }) => {
  const form = FormList((input: number) => FormUnit(input), {
    initial: [1, 2, 3],
  })

  expect(form.getInitial(monitor)).toStrictEqual([1, 2, 3])
  expect(form.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(form.isDirty(monitor)).toBe(false)

  const clone = form.clone()

  expect(clone.getInitial(monitor)).toStrictEqual([1, 2, 3])
  expect(clone.getInput(monitor)).toStrictEqual([1, 2, 3])
  expect(clone.isDirty(monitor)).toBe(false)
})

it("preserves _initialInputs when nested inside a FormShape clone", ({ monitor }) => {
  const form = FormShape({
    items: FormList((input: number) => FormUnit(input), {
      initial: [1, 2, 3],
    }),
  })

  expect(form.getInitial(monitor)).toStrictEqual({ items: [1, 2, 3] })
  expect(form.isDirty(monitor)).toBe(false)

  const clone = form.clone()

  expect(clone.getInitial(monitor)).toStrictEqual({ items: [1, 2, 3] })
  expect(clone.isDirty(monitor)).toBe(false)
})
