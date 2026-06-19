import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormErrorSetter<TForm extends SignalForm> = GetFormParam<TForm, "error.setter">

export type { GetFormErrorSetter }
