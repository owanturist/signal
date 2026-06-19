import type { GetFormFlag } from "../signal-form/get-form-flag"
import type { SignalForm } from "../signal-form/signal-form"

type FormListFlag<TElement extends SignalForm> = boolean | ReadonlyArray<GetFormFlag<TElement>>

export type { FormListFlag }
