# @owanturist/signal-form

## 0.1.1

### Patch Changes

- [#1075](https://github.com/owanturist/signal/pull/1075) [`34fe06a`](https://github.com/owanturist/signal/commit/34fe06a073e03aa29bbcf13955cd92949a93a866) Thanks [@owanturist](https://github.com/owanturist)! - Fix `FormSwitch` verbose output collapsing nested composite branches to their concise shape. `FormSwitchState._outputVerbose` was reading each branch's concise `_output` instead of `_outputVerbose`, so any branch that was itself a `FormSwitch`/`FormShape`/`FormList`/`FormOptional` rendered concisely when reached from a parent switch — even though reading the same node directly produced the verbose shape. Closes [#1071](https://github.com/owanturist/signal/issues/1071).

- [#1077](https://github.com/owanturist/signal/pull/1077) [`98110ca`](https://github.com/owanturist/signal/commit/98110ca5fcdbdfffa226e32a9b2a6cbeb677df15) Thanks [@owanturist](https://github.com/owanturist)! - Fix `FormUnit` accepting multiple output functions at the type level. Previously TypeScript silently allowed combinations like `{ transform, validate }`, `{ transform, schema }`, or `{ validate, schema }`, but at runtime only one was applied (priority: `schema` > `validate` > `transform`) — the others were silently ignored. `FormUnitTransformedOptions`, `FormUnitValidatedOptions`, and `FormUnitSchemaOptions` are now mutually exclusive: passing more than one of `transform`/`validate`/`schema` is a compile error. `validateOn` is also rejected on transform-only options, since the transform branch has no validation lifecycle. Runtime behavior is unchanged. Closes [#912](https://github.com/owanturist/signal/issues/912).

## 0.1.0

### Minor Changes

- [#1054](https://github.com/owanturist/signal/pull/1054) [`28e7915`](https://github.com/owanturist/signal/commit/28e79152c7ba74ed47a6abcebdb0d7af467cb01c) Thanks [@owanturist](https://github.com/owanturist)! - Initial release of `@owanturist/signal-form` and `@owanturist/signal-react` packages.
