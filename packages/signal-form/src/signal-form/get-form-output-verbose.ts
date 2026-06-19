import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormOutputVerbose<TForm extends SignalForm> = GetFormParam<TForm, "output.schema.verbose">

export type { GetFormOutputVerbose }
