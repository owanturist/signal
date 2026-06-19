import type { GetFormParam } from "../signal-form/get-form-param"
import type { SignalForm } from "../signal-form/signal-form"

type FormOptionalOutput<TElement extends SignalForm> =
  | undefined
  | GetFormParam<TElement, "output.schema">

export type { FormOptionalOutput }
