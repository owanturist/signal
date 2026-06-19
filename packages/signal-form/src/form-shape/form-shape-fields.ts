import type { SignalForm } from "../signal-form/signal-form"

/**
 * Self-referential homomorphic constraint: use as `<TFields extends FormShapeFields<TFields>>`.
 *
 * `Record<string, SignalForm>` would reject `interface X { ... }` at user call sites
 * because TS does not infer an implicit string index signature on interfaces (they can
 * be augmented via declaration merging). Mapping over `keyof TFields` instead checks
 * each known key against `SignalForm` without requiring an index signature, so both
 * `interface` and `type` declarations satisfy the constraint.
 */
type FormShapeFields<TFields = Record<string, SignalForm>> = {
  readonly [TField in keyof TFields]: SignalForm
}

export type { FormShapeFields }
