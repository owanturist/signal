import type { FormShapeFields } from "./form-shape-fields"
import type { GetFormShapeParam } from "./get-form-shape-param"

type FormShapeFlagVerbose<TFields extends FormShapeFields<TFields>> = GetFormShapeParam<
  TFields,
  "flag.schema.verbose"
>

export type { FormShapeFlagVerbose }
