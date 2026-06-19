import type { GetFormParam } from "../signal-form/get-form-param"
import type { SignalForm } from "../signal-form/signal-form"

type FormSwitchBranches<TKind extends SignalForm> =
  GetFormParam<TKind, "output.schema"> extends string
    ? Record<GetFormParam<TKind, "output.schema">, SignalForm>
    : never

export type { FormSwitchBranches }
