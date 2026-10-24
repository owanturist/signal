import type { Monitor } from "@owanturist/signal"

import { SignalForm } from "../../signal-form/_internal/signal-form"
import type { FormOptionalParams } from "../form-optional-params"

import type { FormOptionalState } from "./form-optional-state"

class FormOptional<TEnabled extends SignalForm, TElement extends SignalForm> extends SignalForm<
  FormOptionalParams<TEnabled, TElement>
> {
  public static override _getState = SignalForm._getState

  public readonly enabled: TEnabled
  public readonly element: TElement

  public constructor(public readonly _state: FormOptionalState<TEnabled, TElement>) {
    super()

    this.enabled = _state._enabled._host()
    this.element = _state._element._host()
  }

  public getEnabledElement(monitor: Monitor): undefined | TElement {
    return this._state._getEnabledElement(monitor)?._host()
  }
}

export { FormOptional }
