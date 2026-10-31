import type { Setter } from "@owanturist/internals/setter"

type FormUnitInputSetter<TInput> = Setter<TInput, [TInput, TInput]>

export type { FormUnitInputSetter }
