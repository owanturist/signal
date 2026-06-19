import type { GetFormFlagVerbose } from "../signal-form/get-form-flag-verbose"
import type { SignalForm } from "../signal-form/signal-form"

type FormListFlagVerbose<TElement extends SignalForm> = ReadonlyArray<GetFormFlagVerbose<TElement>>

export type { FormListFlagVerbose }
