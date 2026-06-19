import type { GetFormParam } from "./get-form-param"
import type { SignalForm } from "./signal-form"

type GetFormValidateOnVerbose<TForm extends SignalForm> = GetFormParam<
  TForm,
  "validateOn.schema.verbose"
>

export type { GetFormValidateOnVerbose }
