import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeInput<TFields extends FormShapeFields<TFields>> = GetFormShapeParam<
  TFields,
  "input.schema"
>

export type { FormShapeInput }
