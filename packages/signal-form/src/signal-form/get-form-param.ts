import type { SignalFormParams } from "./signal-form-params"
import type { GetFormParams } from "./_internal/get-form-params"

type GetFormParam<TTarget, TKey extends keyof SignalFormParams> = GetFormParams<TTarget>[TKey]

export type { GetFormParam }
