import { untracked } from "@owanturist/signal"
import { z } from "zod"

import { FormList, type FormListOptions, FormUnit } from "../../src"

function setup(options?: FormListOptions<FormUnit<number, ReadonlyArray<string>>>) {
  const form = FormList((input: number) => FormUnit(input, { schema: z.number() }), {
    initial: [1, 2, 3],
    ...options,
  })

  const listener0 = vi.fn()
  const listener1 = vi.fn()
  const listener2 = vi.fn()

  const elements = untracked((monitor) => form.getElements(monitor))

  elements.at(0)?.onFocusWhenInvalid(listener0)
  elements.at(1)?.onFocusWhenInvalid(listener1)
  elements.at(2)?.onFocusWhenInvalid(listener2)

  return [form, [listener0, listener1, listener2]] as const
}

it("does not call listeners on init", () => {
  const [, [listener0, listener1, listener2]] = setup({
    error: [["error0"], ["error1"], ["error2"]],
  })

  expect(listener0).not.toHaveBeenCalled()
  expect(listener1).not.toHaveBeenCalled()
  expect(listener2).not.toHaveBeenCalled()
})

it("does not focus any when all valid", () => {
  const [form, [listener0, listener1, listener2]] = setup()

  form.focusFirstInvalid()

  expect(listener0).not.toHaveBeenCalled()
  expect(listener1).not.toHaveBeenCalled()
  expect(listener2).not.toHaveBeenCalled()
})

it("focuses the first invalid element", () => {
  const [form, [listener0, listener1, listener2]] = setup({
    error: [["error0"], ["error1"], ["error2"]],
  })

  form.focusFirstInvalid()

  expect(listener0).toHaveBeenCalledExactlyOnceWith(["error0"])
  expect(listener1).not.toHaveBeenCalled()
  expect(listener2).not.toHaveBeenCalled()
})

it("calls the only invalid", () => {
  const [form, [listener0, listener1, listener2]] = setup({
    error: [undefined, ["error1"]],
  })

  form.focusFirstInvalid()

  expect(listener0).not.toHaveBeenCalled()
  expect(listener1).toHaveBeenCalledExactlyOnceWith(["error1"])
  expect(listener2).not.toHaveBeenCalled()
})

it("does not focus invalid without listener", ({ monitor }) => {
  const form = FormList<FormUnit<number, string>>(
    (input: number) => FormUnit<number, string>(input),
    {
      initial: [1, 2],
      error: ["err-1", "err-2"],
    },
  )

  const listener1 = vi.fn()

  form.getElements(monitor).at(1)?.onFocusWhenInvalid(listener1)

  form.focusFirstInvalid()
  expect(listener1).toHaveBeenCalledExactlyOnceWith("err-2")
})

describe("with onFocusWhenInvalid()", () => {
  it("does nothing when elements are empty", () => {
    const form = FormList((input: number) => FormUnit(input))
    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).not.toHaveBeenCalled()
  })

  it("does not call a listener when elements are not validated", () => {
    const form = FormList(
      (input: string) =>
        FormUnit(input, {
          schema: z.string().min(2),
        }),
      {
        initial: [""],
      },
    )

    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).not.toHaveBeenCalled()
  })

  it("does not call a listener when elements are valid", () => {
    const form = FormList(
      (input: string) =>
        FormUnit(input, {
          validateOn: "onInit",
          schema: z.string().min(2),
        }),
      {
        initial: ["valid"],
      },
    )

    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).not.toHaveBeenCalled()
  })

  it("calls a listener when an element is not valid", () => {
    const form = FormList(
      (input: string) =>
        FormUnit(input, {
          validateOn: "onInit",
          schema: z.string().min(2),
        }),
      {
        initial: [""],
      },
    )

    const listener0 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.focusFirstInvalid()
    expect(listener0).toHaveBeenCalledExactlyOnceWith([[expect.any(String)]])
  })

  it("does not call a listener when an element is invalid and has own listener", ({ monitor }) => {
    const form = FormList(
      (input: string) =>
        FormUnit(input, {
          validateOn: "onInit",
          schema: z.string().min(2),
        }),
      {
        initial: [""],
      },
    )

    const listener0 = vi.fn()
    const listener1 = vi.fn()

    form.onFocusWhenInvalid(listener0)
    form.getElements(monitor).at(0)?.onFocusWhenInvalid(listener1)
    form.focusFirstInvalid()

    expect(listener0).not.toHaveBeenCalled()
    expect(listener1).toHaveBeenCalledExactlyOnceWith([expect.any(String)])
  })
})
