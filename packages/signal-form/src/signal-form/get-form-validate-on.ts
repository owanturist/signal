import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormValidateOn<TForm extends SignalForm> = GetFormParam<TForm, "validateOn.schema">

export type { GetFormValidateOn }
