import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormInputSetter<TForm extends SignalForm> = GetFormParam<TForm, "input.setter">

export type { GetFormInputSetter }
