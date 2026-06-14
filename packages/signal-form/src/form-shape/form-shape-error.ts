import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeError<TFields extends FormShapeFields<TFields>> = null | GetFormShapeParam<
  TFields,
  "error.schema"
>

export type { FormShapeError }
