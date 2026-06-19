import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormFlagVerbose<TForm extends SignalForm> = GetFormParam<TForm, "flag.schema.verbose">

export type { GetFormFlagVerbose }
