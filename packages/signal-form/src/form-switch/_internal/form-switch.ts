import type { Monitor } from "@owanturist/signal"

import { mapFormHosts } from "../../signal-form/_internal/map-form-states"
import { SignalForm } from "../../signal-form/_internal/signal-form"
import type { FormSwitchActiveBranch } from "../form-switch-active-branch"
import type { FormSwitchBranches } from "../form-switch-branches"
import type { FormSwitchParams } from "../form-switch-params"

import type { FormSwitchState } from "./form-switch-state"

class FormSwitch<
  TKind extends SignalForm,
  TBranches extends FormSwitchBranches<TKind>,
> extends SignalForm<FormSwitchParams<TKind, TBranches>> {
  public static override _getState = SignalForm._getState

  public readonly active: TKind

  public readonly branches: Readonly<TBranches>

  public constructor(public readonly _state: FormSwitchState<TKind, TBranches>) {
    super()

    this.active = _state._active._host()

    this.branches = mapFormHosts(_state._branches)
  }

  public getActiveBranch(monitor: Monitor): undefined | FormSwitchActiveBranch<TBranches> {
    const result = this._state._getActiveBranch(monitor)

    if (!result) {
      return undefined
    }

    return {
      kind: result.kind,
      value: result.value._host(),
    }
  }
}

export { FormSwitch }
