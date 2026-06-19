import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeOutput<TFields extends FormShapeFields<TFields>> = GetFormShapeParam<
  TFields,
  "output.schema"
>

export type { FormShapeOutput }
