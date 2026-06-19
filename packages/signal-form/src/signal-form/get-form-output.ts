import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormOutput<TForm extends SignalForm> = GetFormParam<TForm, "output.schema">

export type { GetFormOutput }
