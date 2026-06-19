import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeErrorVerbose<TFields extends FormShapeFields<TFields>> = GetFormShapeParam<
  TFields,
  "error.schema.verbose"
>

export type { FormShapeErrorVerbose }
