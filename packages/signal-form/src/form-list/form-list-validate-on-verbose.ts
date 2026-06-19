import type { GetFormValidateOnVerbose } from "../signal-form/get-form-validate-on-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListValidateOnVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetFormValidateOnVerbose<TElement>
>

export type { FormListValidateOnVerbose }
