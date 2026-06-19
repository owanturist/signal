import type { GetFormOutputVerbose } from "../signal-form/get-form-output-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListOutputVerbose<TElement extends SignalForm> = ReadonlyArray<
  GetFormOutputVerbose<TElement>
>

export type { FormListOutputVerbose }
