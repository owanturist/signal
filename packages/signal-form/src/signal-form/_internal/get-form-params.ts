import type { SignalForm } from "./signal-form"

type GetFormParams<TTarget> = TTarget extends SignalForm<infer TParams> ? TParams : never

export type { GetFormParams }
