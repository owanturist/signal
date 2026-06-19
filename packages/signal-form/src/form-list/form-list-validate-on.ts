import type { GetFormValidateOn } from "../signal-form/get-form-validate-on"
import type { SignalForm } from "../signal-form/signal-form"
import type { ValidateStrategy } from "../validate-strategy"

type FormListValidateOn<TElement extends SignalForm> =
  | ValidateStrategy
  | ReadonlyArray<GetFormValidateOn<TElement>>

export type { FormListValidateOn }
