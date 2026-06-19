import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormFlag<TForm extends SignalForm> = GetFormParam<TForm, "flag.schema">

export type { GetFormFlag }
