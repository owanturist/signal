---
"@owanturist/signal-form": patch
---

Fix `FormUnit` accepting multiple output functions at the type level. Previously TypeScript silently allowed combinations like `{ transform, validate }`, `{ transform, schema }`, or `{ validate, schema }`, but at runtime only one was applied (priority: `schema` > `validate` > `transform`) — the others were silently ignored. `FormUnitTransformedOptions`, `FormUnitValidatedOptions`, and `FormUnitSchemaOptions` are now mutually exclusive: passing more than one of `transform`/`validate`/`schema` is a compile error. `validateOn` is also rejected on transform-only options, since the transform branch has no validation lifecycle. Runtime behavior is unchanged. Closes [#912](https://github.com/owanturist/signal/issues/912).
