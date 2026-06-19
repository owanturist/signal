import type { GetFormOutput } from "../signal-form/get-form-output"
import type { SignalForm } from "../signal-form/signal-form"

type FormListOutput<TElement extends SignalForm> = ReadonlyArray<GetFormOutput<TElement>>

export type { FormListOutput }
