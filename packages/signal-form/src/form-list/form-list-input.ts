import type { GetFormInput } from "../signal-form/get-form-input"
import type { SignalForm } from "../signal-form/signal-form"

type FormListInput<TElement extends SignalForm> = ReadonlyArray<GetFormInput<TElement>>

export type { FormListInput }
