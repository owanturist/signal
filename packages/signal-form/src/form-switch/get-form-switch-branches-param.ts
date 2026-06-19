import type { Compute } from "~/tools/compute"

import type { GetFormParam } from "../signal-form/get-form-param"
import type { SignalForm } from "../signal-form/signal-form"
import type { SignalFormParams } from "../signal-form/signal-form-params"

import type { FormSwitchBranches } from "./form-switch-branches"

type GetFormSwitchBranchesParam<
  TBranches extends FormSwitchBranches<SignalForm>,
  TKey extends keyof SignalFormParams,
> = Compute<{
  readonly [TBranch in keyof TBranches]: GetFormParam<TBranches[TBranch], TKey>
}>

export type { GetFormSwitchBranchesParam }
