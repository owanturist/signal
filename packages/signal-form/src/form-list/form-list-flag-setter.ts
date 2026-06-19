import type { Setter } from "~/tools/setter"

import type { GetFormFlagSetter } from "../signal-form/get-form-flag-setter"
import type { SignalForm } from "../signal-form/signal-form"

import type { FormListFlagVerbose } from "./form-list-flag-verbose"

type FormListFlagSetter<TElement extends SignalForm> = Setter<
  boolean | ReadonlyArray<undefined | GetFormFlagSetter<TElement>>,
  [FormListFlagVerbose<TElement>]
>

export type { FormListFlagSetter }
