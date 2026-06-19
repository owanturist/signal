import type { GetFormOutput } from "../../signal-form/get-form-output"
import type { GetFormParam } from "../../signal-form/get-form-param"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormSwitchBranch } from "../form-switch-branch"
import type { FormSwitchBranches } from "../form-switch-branches"

type FormSwitchBranchUnion<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
  TKey extends keyof SignalFormParams,
> = {
  [TBranch in GetFormOutput<TKind>]: FormSwitchBranch<
    TBranch,
    GetFormParam<TBranches[TBranch], TKey>
  >
}[GetFormOutput<TKind>]

export type { FormSwitchBranchUnion }
