import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormInput<TForm extends SignalForm> = GetFormParam<TForm, "input.schema">

export type { GetFormInput }
