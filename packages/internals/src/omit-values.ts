import type { Compute } from "./compute"
import type { FilterKeys } from "./filter-keys"

type OmitValues<TObject, TValue> = Compute<Omit<TObject, FilterKeys<TObject, TValue>>>

export type { OmitValues }
