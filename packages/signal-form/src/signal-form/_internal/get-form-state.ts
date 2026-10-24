import type { GetFormParams } from "./get-form-params"
import type { SignalForm } from "./signal-form"
import type { SignalFormState } from "./signal-form-state"

type GetFormState<TForm extends SignalForm> = SignalFormState<GetFormParams<TForm>, TForm>

export type { GetFormState }
