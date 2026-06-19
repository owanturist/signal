import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormErrorVerbose<TForm extends SignalForm> = GetFormParam<TForm, "error.schema.verbose">

export type { GetFormErrorVerbose }
