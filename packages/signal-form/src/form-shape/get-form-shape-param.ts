import type { GetFormParam } from "../signal-form/get-form-param"
import type { SignalFormParams } from "../signal-form/signal-form-params"

import type { FormShapeFields } from "./form-shape-fields"

type GetFormShapeParam<
  TFields extends FormShapeFields<TFields>,
  TKey extends keyof SignalFormParams,
> = {
  readonly [TField in keyof TFields]: GetFormParam<TFields[TField], TKey>
}

export type { GetFormShapeParam }
