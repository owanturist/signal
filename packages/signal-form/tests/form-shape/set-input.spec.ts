import type { Setter } from "~/tools/setter"

import { FormShape, FormUnit } from "../../src"

it("updates original value", ({ monitor }) => {
  const shape = FormShape({
    first: FormUnit(""),
    second: FormUnit(0),
    third: FormShape({
      one: FormUnit(true),
      two: FormUnit([""]),
    }),
  })

  expect(shape.getInput(monitor)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: true,
      two: [""],
    },
  })

  shape.setInput({
    third: {
      one: false,
      two: undefined,
    },
  })
  expect(shape.getInput(monitor)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: false,
      two: [""],
    },
  })

  shape.setInput({
    third: {
      two: (two) => [...two, "hi"],
    },
  })
  expect(shape.getInput(monitor)).toStrictEqual({
    first: "",
    second: 0,
    third: {
      one: false,
      two: ["", "hi"],
    },
  })

  shape.setInput({
    first: "1",
    second: 2,
    third: {
      one: true,
      two: ["two"],
    },
  })
  expect(shape.getInput(monitor)).toStrictEqual({
    first: "1",
    second: 2,
    third: {
      one: true,
      two: ["two"],
    },
  })

  shape.setInput((root) => {
    expect(root).toStrictEqual({
      first: "1",
      second: 2,
      third: {
        one: true,
        two: ["two"],
      },
    })

    return {
      first: (first) => {
        expect(first).toBe("1")

        return "one"
      },
      second: (second) => {
        expect(second).toBe(2)

        return 3
      },
      third: (third) => {
        expect(third).toStrictEqual({
          one: true,
          two: ["two"],
        })

        return {
          one: (one) => {
            expect(one).toBe(true)

            return false
          },
          two: (two) => {
            expect(two).toStrictEqual(["two"])

            return [...two, "three"]
          },
        }
      },
    }
  })
  expect(shape.getInput(monitor)).toStrictEqual({
    first: "one",
    second: 3,
    third: {
      one: false,
      two: ["two", "three"],
    },
  })

  expectTypeOf(shape.getInput(monitor)).toEqualTypeOf<{
    readonly first: string
    readonly second: number
    readonly third: {
      readonly one: boolean
      readonly two: Array<string>
    }
  }>()

  expect(shape.fields.third.getInput(monitor)).toStrictEqual({
    one: false,
    two: ["two", "three"],
  })

  expectTypeOf(shape.fields.third.getInput(monitor)).toEqualTypeOf<{
    readonly one: boolean
    readonly two: Array<string>
  }>()

  expectTypeOf(shape.setInput).parameter(0).toEqualTypeOf<
    Setter<
      {
        readonly first?: Setter<string, [string, string]>
        readonly second?: Setter<number, [number, number]>
        readonly third?: Setter<
          {
            readonly one?: Setter<boolean, [boolean, boolean]>
            readonly two?: Setter<Array<string>, [Array<string>, Array<string>]>
          },
          [
            {
              readonly one: boolean
              readonly two: Array<string>
            },
            {
              readonly one: boolean
              readonly two: Array<string>
            },
          ]
        >
      },
      [
        {
          readonly first: string
          readonly second: number
          readonly third: {
            readonly one: boolean
            readonly two: Array<string>
          }
        },
        {
          readonly first: string
          readonly second: number
          readonly third: {
            readonly one: boolean
            readonly two: Array<string>
          }
        },
      ]
    >
  >()

  expectTypeOf(shape.fields.third.setInput).parameter(0).toEqualTypeOf<
    Setter<
      {
        readonly one?: Setter<boolean, [boolean, boolean]>
        readonly two?: Setter<Array<string>, [Array<string>, Array<string>]>
      },
      [
        {
          readonly one: boolean
          readonly two: Array<string>
        },
        {
          readonly one: boolean
          readonly two: Array<string>
        },
      ]
    >
  >()
})
