import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormFlagSetter<TForm extends SignalForm> = GetFormParam<TForm, "flag.setter">

export type { GetFormFlagSetter }
