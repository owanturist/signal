import { mapValues } from "~/tools/map-values"

import type { GetFormState } from "./get-form-state"
import type { SignalForm } from "./signal-form"

type SignalFormRecord<TForms> = {
  readonly [TKey in keyof TForms]: SignalForm
}

type GetFormStates<TForms extends SignalFormRecord<TForms>> = {
  [TKey in keyof TForms]: GetFormState<TForms[TKey]>
}

/*
 * `mapValues` types its result as `Record<keyof TObject, TResult>`, which loses the per-key form type.
 * The mappers below are generic in TForm, so applying them per key preserves each key's form type.
 */

function mapForms<TForms extends SignalFormRecord<TForms>>(
  forms: TForms,
  getState: <TForm extends SignalForm>(form: TForm) => GetFormState<TForm>,
): GetFormStates<TForms> {
  // biome-ignore lint/nursery/noUnsafeTypeAssertion: getState is generic in TForm, so the per-key form type is preserved
  return mapValues(forms, getState) as GetFormStates<TForms>
}

function mapFormStates<TForms extends SignalFormRecord<TForms>>(
  states: GetFormStates<TForms>,
  mapState: <TForm extends SignalForm>(state: GetFormState<TForm>) => GetFormState<TForm>,
): GetFormStates<TForms> {
  // biome-ignore lint/nursery/noUnsafeTypeAssertion: mapState is generic in TForm, so the per-key form type is preserved
  return mapValues(states, mapState) as GetFormStates<TForms>
}

function mapFormHosts<TForms extends SignalFormRecord<TForms>>(
  states: GetFormStates<TForms>,
): TForms {
  // biome-ignore lint/nursery/noUnsafeTypeAssertion: each GetFormState<TForms[TKey]> hosts TForms[TKey]
  return mapValues(states, ({ _host }) => _host()) as TForms
}

export type { GetFormStates, SignalFormRecord }
export { mapFormHosts, mapFormStates, mapForms }
