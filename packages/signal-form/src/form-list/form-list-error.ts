import type { GetFormError } from "../signal-form/get-form-error"
import type { SignalForm } from "../signal-form/signal-form"

type FormListError<TElement extends SignalForm> = null | ReadonlyArray<GetFormError<TElement>>

export type { FormListError }
