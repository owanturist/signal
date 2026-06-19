import type { GetFormParam } from "../../signal-form/get-form-param"
import type { SignalForm } from "../../signal-form/signal-form"
import type { SignalFormParams } from "../../signal-form/signal-form-params"
import type { FormSwitchBranches } from "../form-switch-branches"
import type { FormSwitchConciseSchema } from "../form-switch-concise-schema"

import type { FormSwitchBranchUnion } from "./form-switch-branch-union"

type FormSwitchConciseParam<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
  TKey extends keyof SignalFormParams,
  TConcise,
> =
  | TConcise
  | FormSwitchConciseSchema<
      TConcise | GetFormParam<TKind, TKey>,
      TConcise | FormSwitchBranchUnion<TKind, TBranches, TKey>
    >

export type { FormSwitchConciseParam }
