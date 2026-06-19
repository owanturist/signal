---
"@owanturist/signal-form": minor
---

Rename `GetSignalForm*` helper types and `isSignalForm` to drop the `Signal` prefix. The `SignalForm` class and `SignalFormParams` interface keep their names.

## Renames

| Before                           | After                      |
| -------------------------------- | -------------------------- |
| `GetSignalFormError`             | `GetFormError`             |
| `GetSignalFormErrorSetter`       | `GetFormErrorSetter`       |
| `GetSignalFormErrorVerbose`      | `GetFormErrorVerbose`      |
| `GetSignalFormFlag`              | `GetFormFlag`              |
| `GetSignalFormFlagSetter`        | `GetFormFlagSetter`        |
| `GetSignalFormFlagVerbose`       | `GetFormFlagVerbose`       |
| `GetSignalFormInput`             | `GetFormInput`             |
| `GetSignalFormInputSetter`       | `GetFormInputSetter`       |
| `GetSignalFormOutput`            | `GetFormOutput`            |
| `GetSignalFormOutputVerbose`     | `GetFormOutputVerbose`     |
| `GetSignalFormParam`             | `GetFormParam`             |
| `GetSignalFormValidateOn`        | `GetFormValidateOn`        |
| `GetSignalFormValidateOnSetter`  | `GetFormValidateOnSetter`  |
| `GetSignalFormValidateOnVerbose` | `GetFormValidateOnVerbose` |

## Migration

```ts
// Before
import { type GetSignalFormInput, type GetSignalFormOutput } from "@owanturist/signal-form"

// After
import { type GetFormInput, type GetFormOutput } from "@owanturist/signal-form"
```
