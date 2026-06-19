import type { GetFormErrorVerbose } from "../signal-form/get-form-error-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListErrorVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetFormErrorVerbose<TElement>
>

export type { FormListErrorVerbose }
