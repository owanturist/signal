import { mapValues } from "~/tools/map-values"

import { SignalForm } from "../../signal-form/_internal/signal-form"
import type { FormShapeFields } from "../form-shape-fields"
import type { FormShapeParams } from "../form-shape-params"

import type { FormShapeState } from "./form-shape-state"

class FormShape<TFields extends FormShapeFields<TFields>> extends SignalForm<
  FormShapeParams<TFields>
> {
  public static override _getState = SignalForm._getState

  public readonly fields: TFields

  public constructor(public readonly _state: FormShapeState<TFields>) {
    super()

    this.fields = mapValues(_state._fields, ({ _host }) => _host()) as TFields
  }
}

export { FormShape }
