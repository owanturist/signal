import type { Monitor } from "@owanturist/signal"
import z from "zod"

import { params } from "~/tools/params"

import {
  FormList,
  type FormListOptions,
  FormOptional,
  FormShape,
  FormSwitch,
  FormUnit,
} from "../../src"

interface Element {
  first: FormUnit<number>
  second: FormUnit<string>
}

interface ElementInput {
  first: number
  second: string
}

const DEFAULT_INPUT: ElementInput = { first: 0, second: "" }

function mergeInput(partial?: Partial<ElementInput>): ElementInput {
  return {
    first: partial?.first ?? DEFAULT_INPUT.first,
    second: partial?.second ?? DEFAULT_INPUT.second,
  }
}

interface ItemSpec {
  input?: Partial<ElementInput>
  initial?: Partial<ElementInput>
}

function setupItems(items: ReadonlyArray<ItemSpec>, options?: FormListOptions<FormShape<Element>>) {
  // For each item, the initial value defaults to the input if provided (so an item
  // specifying only `input: {first:1}` has initial = {first:1, second:""}). The input
  // value defaults to the constructor default (so an item specifying only
  // `initial: {first:1}` has input = {first:0, second:""}).
  const initials = items.map((it) => mergeInput(it.initial ?? it.input))
  const inputs = items.map((it) => mergeInput(it.input))

  return FormList<FormShape<Element>>(
    (input: ElementInput) =>
      FormShape({
        first: FormUnit(input.first),
        second: FormUnit(input.second),
      }),
    initials,
    { input: inputs, ...options },
  )
}

function setupElement(input?: Partial<ElementInput>) {
  const merged = mergeInput(input)
  return FormShape({
    first: FormUnit(merged.first),
    second: FormUnit(merged.second),
  })
}

it("matches the type signature", ({ monitor }) => {
  const form = setupItems([{}])

  expectTypeOf(form.isDirty).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(
      monitor: Monitor,
      select: (
        concise:
          | boolean
          | ReadonlyArray<
              | boolean
              | {
                  readonly first: boolean
                  readonly second: boolean
                }
            >,
        verbose: ReadonlyArray<{
          readonly first: boolean
          readonly second: boolean
        }>,
      ) => TResult,
    ): TResult
  }>()

  expectTypeOf(form.getElements(monitor).at(0)!.isDirty).toEqualTypeOf<{
    (monitor: Monitor): boolean

    <TResult>(
      monitor: Monitor,
      select: (
        concise:
          | boolean
          | {
              readonly first: boolean
              readonly second: boolean
            },
        verbose: {
          readonly first: boolean
          readonly second: boolean
        },
      ) => TResult,
    ): TResult
  }>()
})

it("returns false for empty list", ({ monitor }) => {
  const form = setupItems([])

  expect(form.isDirty(monitor)).toBe(false)
  expect(form.isDirty(monitor, params._first)).toBe(false)
  expect(form.isDirty(monitor, params._second)).toStrictEqual([])
})

it("returns false for pristine list", ({ monitor }) => {
  const form = setupItems([{}, {}])

  expect(form.isDirty(monitor)).toBe(false)
  expect(form.isDirty(monitor, params._first)).toBe(false)
  expect(form.isDirty(monitor, params._second)).toStrictEqual([
    { first: false, second: false },
    { first: false, second: false },
  ])

  expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
    false,
    false,
  ])
})

it("returns true when at least one element is dirty", ({ monitor }) => {
  const form = setupItems([{ initial: { first: 1 } }, {}])

  expect(form.isDirty(monitor)).toBe(true)
  expect(form.isDirty(monitor, params._first)).toStrictEqual([
    { first: true, second: false },
    false,
  ])
  expect(form.isDirty(monitor, params._second)).toStrictEqual([
    { first: true, second: false },
    { first: false, second: false },
  ])

  expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
    true,
    false,
  ])
})

it("returns true when all elements are dirty", ({ monitor }) => {
  const form = setupItems([{ initial: { first: 1 } }, { initial: { second: "2" } }])

  expect(form.isDirty(monitor)).toBe(true)
  expect(form.isDirty(monitor, params._first)).toStrictEqual([
    { first: true, second: false },
    { first: false, second: true },
  ])
  expect(form.isDirty(monitor, params._second)).toStrictEqual([
    { first: true, second: false },
    { first: false, second: true },
  ])

  expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
    true,
    true,
  ])
})

describe("adding a new element to the list's end", () => {
  it("returns true for a new pristine element and a pristine list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [...elements, setupElement()])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([false, false, true])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      false,
    ])
  })

  it("returns true for a new pristine element and a dirty list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 3, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [...elements, setupElement()])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([
      false,
      { first: true, second: false },
      true,
    ])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: false },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      true,
      false,
    ])
  })

  it("returns true for a new dirty element and a pristine list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [
      ...elements,
      FormShape({
        first: FormUnit(0, { initial: 3 }),
        second: FormUnit(""),
      }),
    ])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([false, false, true])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      true,
    ])
  })

  it("returns true for a new dirty element and a dirty list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "4" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [
      ...elements,
      FormShape({
        first: FormUnit(0, { initial: 3 }),
        second: FormUnit("", { initial: "3" }),
      }),
    ])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([
      { first: false, second: true },
      false,
      true,
    ])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: true },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      false,
      true,
    ])
  })
})

// Behavior change in the factory-based FormList: prepending an element with
// slot-wins setElements pushes initialInputs[i] into each child at its new index
// (which differs from the legacy mounting-override semantics). The block below
// reflects the new semantics.
describe("adding a new element to the list's beginning", () => {
  it("returns true for a new pristine element and a pristine list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      true,
      false,
    ])
  })

  it("returns true for a new pristine element and a dirty list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 3, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [setupElement(), ...elements])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      true,
      true,
    ])
  })

  it("returns true for a new dirty element and a pristine list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [setupElement({ first: 3 }), ...elements])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      true,
      false,
    ])
  })

  it("returns true for a new dirty element and a dirty list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "4" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [setupElement({ first: 3, second: "3" }), ...elements])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      true,
      false,
    ])
  })

  it("returns true for a new same element and a pristine list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [setupElement({ first: 1, second: "1" }), ...elements])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([false, true, true])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      true,
      false,
    ])
  })
})

// Behavior change: with the factory-based FormList, the verbose dirty signal
// reports only present elements (length = elements.length). The "removed slots"
// case still surfaces in the concise `isDirty` signal as true.
describe("removing an initial element from the list's end", () => {
  it("returns true for a pristine list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 3, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements((elements) => elements.slice(0, 2))

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
    ])
  })

  it("returns true a dirty list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 3, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 3, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements((elements) => elements.slice(0, 2))

    // concise collapses to `true` whenever any slot is removed
    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      true,
    ])
  })
})

describe("removing an initial element from the list's beginning", () => {
  it("returns true for a pristine list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 3, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements((elements) => elements.slice(1))

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      true,
    ])
  })

  it("returns true for a dirty list", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 4, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements((elements) => elements.slice(1))

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      true,
    ])
  })

  it("returns true for a deleting the same element", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => elements.slice(1))

    // concise collapses to `true` whenever any slot is removed
    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      true,
    ])
  })

  describe("when using FormSwitch", () => {
    function setupSwitchElement(count: number) {
      return FormSwitch(
        FormUnit("_1", {
          schema: z.enum(["_1", "_2"]),
        }),
        {
          _1: FormUnit(count),
          _2: FormSwitch(
            FormUnit("_3", {
              schema: z.enum(["_3", "_4"]),
            }),
            {
              _3: FormUnit(count),
              _4: FormUnit(count),
            },
          ),
        },
      )
    }

    it("returns true for a removed switch", ({ monitor }) => {
      const form = FormList(() => setupSwitchElement(1), [undefined as unknown as never])

      form.setElements([])

      expect(form.isDirty(monitor)).toBe(true)
      expect(form.isDirty(monitor, params._first)).toBe(true)
      // verbose dirty no longer reports removed-tail slots
      expect(form.isDirty(monitor, params._second)).toStrictEqual([])
    })

    it("returns true for a added switch", ({ monitor }) => {
      const form = FormList(() => setupSwitchElement(1), [undefined as unknown as never])

      form.setElements((elements) => [...elements, setupSwitchElement(2)])

      expect(form.isDirty(monitor)).toBe(true)
      expect(form.isDirty(monitor, params._first)).toStrictEqual([false, true])
      expect(form.isDirty(monitor, params._second)).toStrictEqual([
        {
          active: false,
          branches: {
            _1: false,
            _2: {
              active: false,
              branches: {
                _3: false,
                _4: false,
              },
            },
          },
        },
        {
          active: true,
          branches: {
            _1: true,
            _2: {
              active: true,
              branches: {
                _3: true,
                _4: true,
              },
            },
          },
        },
      ])
    })
  })

  describe("when using FormOptional", () => {
    function setupOptionalElement(count: number) {
      return FormOptional(FormUnit(true), FormOptional(FormUnit(true), FormUnit(count)))
    }

    it("returns true for a removed optional", ({ monitor }) => {
      const form = FormList(() => setupOptionalElement(1), [undefined as unknown as never])

      form.setElements([])

      expect(form.isDirty(monitor)).toBe(true)
      expect(form.isDirty(monitor, params._first)).toBe(true)
      // verbose dirty no longer reports removed-tail slots
      expect(form.isDirty(monitor, params._second)).toStrictEqual([])
    })

    it("returns true for a added switch", ({ monitor }) => {
      const form = FormList(() => setupOptionalElement(1), [undefined as unknown as never])

      form.setElements((elements) => [...elements, setupOptionalElement(2)])

      expect(form.isDirty(monitor)).toBe(true)
      expect(form.isDirty(monitor, params._first)).toStrictEqual([false, true])
      expect(form.isDirty(monitor, params._second)).toStrictEqual([
        {
          enabled: false,
          element: {
            enabled: false,
            element: false,
          },
        },
        {
          enabled: true,
          element: {
            enabled: true,
            element: true,
          },
        },
      ])
    })
  })
})

describe("swapping elements", () => {
  it("returns true for two pristine unequal elements", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 3, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements(([first, second, third]) => [third!, second!, first!])

    expect(form.getInput(monitor)).toStrictEqual([
      { first: 3, second: "3" },
      { first: 2, second: "2" },
      { first: 1, second: "1" },
    ])

    expect(form.getInitial(monitor)).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
      { first: 3, second: "3" },
    ])

    expect(form.getElements(monitor).map((element) => element.getInitial(monitor))).toStrictEqual([
      { first: 1, second: "1" },
      { first: 2, second: "2" },
      { first: 3, second: "3" },
    ])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([true, false, true])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      false,
      true,
    ])
  })

  it("returns false for two pristine equal elements", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
    ])

    form.setElements(([first, second, third]) => [third!, second!, first!])

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      false,
    ])
  })
})

describe("after FormList#reset()", () => {
  it("resets original to initial values", ({ monitor }) => {
    const form = setupItems([
      { initial: { first: 1, second: "1" } },
      { initial: { first: 2, second: "2" } },
      { initial: { first: 3, second: "3" } },
    ])

    form.reset()

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      false,
    ])
  })

  it("restores a removed element", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 3, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements((elements) => elements.slice(0, 2))

    form.reset()

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      false,
    ])
  })

  it("restores all removed elements", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 3, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements([])

    form.reset()

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      false,
    ])
  })

  it("removes new elements", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [setupElement(), ...elements, setupElement()])

    form.reset()

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
    ])
  })

  it("removes all elements for an empty initial list", ({ monitor }) => {
    const form = setupItems([])

    form.setElements([setupElement(), setupElement()])

    form.reset()

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([])
  })
})

describe("after FormList#setInitial()", () => {
  it("returns false when dirty elements set as initial", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 2, second: "2" }, initial: { first: 1, second: "1" } },
      { input: { first: 3, second: "3" }, initial: { first: 2, second: "2" } },
    ])

    form.setInitial((_, input) => input)

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
    ])
  })

  it("returns true when pristine elements change initial", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setInitial([
      { first: 2, second: "2" },
      { first: 3, second: "3" },
    ])

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toBe(true)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      true,
    ])
  })

  it("returns false when initial elements are assigned from the new elements' original values", ({
    monitor,
  }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [
      setupElement({ first: 0, second: "0" }),
      ...elements,
      setupElement({ first: 3, second: "3" }),
    ])
    form.setInitial((_, input) => input)

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      false,
      false,
    ])
  })

  it("returns false when removes initial value of deleted element", ({ monitor }) => {
    const form = setupItems([
      { input: { first: 1, second: "1" }, initial: { first: 1, second: "1" } },
      { input: { first: 2, second: "2" }, initial: { first: 2, second: "2" } },
      { input: { first: 3, second: "3" }, initial: { first: 3, second: "3" } },
    ])

    form.setElements((elements) => elements.slice(0, 2))
    form.setInitial((initial) => initial.slice(0, 2))

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
    ])
  })
})

describe("after FormList#getElements()#at()#setInitial()", () => {
  it("return true after updating pristine element's initial value", ({ monitor }) => {
    const form = setupItems([
      { initial: { first: 1, second: "1" }, input: { first: 1, second: "1" } },
      { initial: { first: 2, second: "2" }, input: { first: 2, second: "2" } },
    ])

    form.getElements(monitor).at(0)!.setInitial({ first: 2 })

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([
      { first: true, second: false },
      false,
    ])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: true, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      true,
      false,
    ])
  })

  it("return false after updating dirty element's initial value", ({ monitor }) => {
    const form = setupItems([
      { initial: { first: 2, second: "1" }, input: { first: 1, second: "1" } },
      { initial: { first: 2, second: "2" }, input: { first: 2, second: "2" } },
    ])

    form.getElements(monitor).at(0)!.setInitial({ first: 1 })

    expect(form.isDirty(monitor)).toBe(false)
    expect(form.isDirty(monitor, params._first)).toBe(false)
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
    ])
  })

  it("ignores setting initial value for a new dirty element at the end", ({ monitor }) => {
    const form = setupItems([
      { initial: { first: 1, second: "1" }, input: { first: 1, second: "1" } },
      { initial: { first: 2, second: "2" }, input: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [...elements, setupElement({ first: 3, second: "3" })])

    form.getElements(monitor).at(2)!.setInitial({ first: 3, second: "3" })

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([false, false, true])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: false, second: false },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      false,
      false,
    ])
  })

  it("updates list element initial value for a new dirty element in the beginning", ({
    monitor,
  }) => {
    const form = setupItems([
      { initial: { first: 1, second: "1" }, input: { first: 1, second: "1" } },
      { initial: { first: 2, second: "2" }, input: { first: 2, second: "2" } },
    ])

    form.setElements((elements) => [setupElement({ first: 3, second: "3" }), ...elements])

    form.getElements(monitor).at(0)!.setInitial({ first: 3, second: "3" })

    expect(form.isDirty(monitor)).toBe(true)
    expect(form.isDirty(monitor, params._first)).toStrictEqual([false, true, true])
    expect(form.isDirty(monitor, params._second)).toStrictEqual([
      { first: false, second: false },
      { first: true, second: true },
      { first: true, second: true },
    ])

    expect(form.getElements(monitor).map((element) => element.isDirty(monitor))).toStrictEqual([
      false,
      true,
      false,
    ])
  })
})
