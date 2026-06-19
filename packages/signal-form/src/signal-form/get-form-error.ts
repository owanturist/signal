import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormError<TForm extends SignalForm> = GetFormParam<TForm, "error.schema">

export type { GetFormError }
