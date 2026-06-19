import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormValidateOnSetter<TForm extends SignalForm> = GetFormParam<TForm, "validateOn.setter">

export type { GetFormValidateOnSetter }
