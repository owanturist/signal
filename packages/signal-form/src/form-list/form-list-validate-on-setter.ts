import type { Setter } from "~/tools/setter"

import type { GetFormValidateOnSetter } from "../signal-form/get-form-validate-on-setter"
import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

import type { FormListValidateOnVerbose } from "./form-list-validate-on-verbose"

type FormListValidateOnSetter<TElement extends SignalForm> = Setter<
  ValidateStrategy | ReadonlyArray<undefined | GetFormValidateOnSetter<TElement>>,
  [FormListValidateOnVerbose<TElement>]
>

export type { FormListValidateOnSetter }
