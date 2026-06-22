# @owanturist/signal-form

## 0.5.0

### Minor Changes

- [#1087](https://github.com/owanturist/signal/pull/1087) [`8c673c3`](https://github.com/owanturist/signal/commit/8c673c321f46e17b88a8b690c19226c4d3dc9fe5) Thanks [@owanturist](https://github.com/owanturist)! - Revert per-element setter shape from `FormListInputSetter`. Each slot of `FormList.setInput` / `setInitial` / `reset` is now a plain input value again — the same shape as before the previous release. The top-level callback form (a function that returns the full array) is unchanged.

  The per-element setter form was unsound for the factory growth path: a partial setter (e.g. `{ first: 2 }` for a `FormShape` element) typechecked at the list level but produced a malformed slot when it reached the factory, which expects a full `GetFormInput<TElement>`. Without a way to type-distinguish "patch existing slot" from "grow new slot", the safer shape is plain inputs.

  ```ts
  const list = FormList(
    (input: { first: number; second: string }) =>
      FormShape({
        first: FormUnit(input.first),
        second: FormUnit(input.second),
      }),
    { initial: [{ first: 1, second: "1" }] }
  );

  // Before: per-slot setter was accepted (and could be partial)
  list.setInitial([{ first: 2 }]);

  // After: each slot must be a full input
  list.setInitial([{ first: 2, second: "2" }]);
  ```

  To update a single element without touching the rest, use the element's own setter:

  ```ts
  list.getElements(monitor).at(0)!.setInitial({ first: 2, second: "2" });
  ```

## 0.4.0

### Minor Changes

- [#1085](https://github.com/owanturist/signal/pull/1085) [`9c83d02`](https://github.com/owanturist/signal/commit/9c83d029cd422d46c8a36e6a5633d06d2e3eecdd) Thanks [@owanturist](https://github.com/owanturist)! - `FormList.setInput` / `setInitial` / `reset` now accept per-element setters inside the array, and `FormListOptions.initial` / `input` are restricted to plain value arrays (no callback at the options level).

  ## `setInput` / `setInitial` / `reset` accept per-element setters

  Each slot of the array argument may now be either a raw input value or a `Setter<TInput, [TInput, TInput]>` — the same setter shape an individual element's `setInput` accepts. The top-level callback form (a function that returns the full array) still works.

  ```ts
  const list = FormList((n: number) => FormUnit(n), { initial: [0, 1, 2] });

  // Before: only raw values were allowed inside the array.
  list.setInput([10, 20, 30]);

  // After: per-slot setters are allowed too.
  list.setInput([10, (prev) => prev + 1, 30]);
  ```

  ## `FormListOptions.initial` / `input` no longer accept a callback

  The options-level `initial` and `input` are now typed as `FormListInput<TElement>` (a plain `ReadonlyArray<TInput>`), not `FormListInputSetter<TElement>`. There is no prior state to feed a callback at construction time, so the callback form is gone.

  ```ts
  // Before: callback was accepted (and was always called with `[]`).
  FormList((n: number) => FormUnit(n), {
    initial: (prev) => prev.concat([1, 2, 3]),
  });

  // After: pass the array directly.
  FormList((n: number) => FormUnit(n), {
    initial: [1, 2, 3],
  });
  ```

## 0.3.0

### Minor Changes

- [#1081](https://github.com/owanturist/signal/pull/1081) [`9fdcf95`](https://github.com/owanturist/signal/commit/9fdcf9505a1c88e4901d0d759f14c4bbc5b00645) Thanks [@owanturist](https://github.com/owanturist)! - Rename `GetSignalForm*` helper types and `isSignalForm` to drop the `Signal` prefix. The `SignalForm` class and `SignalFormParams` interface keep their names.

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
  import {
    type GetSignalFormInput,
    type GetSignalFormOutput,
  } from "@owanturist/signal-form";

  // After
  import {
    type GetFormInput,
    type GetFormOutput,
  } from "@owanturist/signal-form";
  ```

## 0.2.0

### Minor Changes

- [#1078](https://github.com/owanturist/signal/pull/1078) [`1e9a426`](https://github.com/owanturist/signal/commit/1e9a426d463c8d2d5e3cfe2e40a07044e4d91572) Thanks [@owanturist](https://github.com/owanturist)! - `FormList` now takes a factory function instead of a pre-built array of elements, and `setInput` / `setInitial` may grow or shrink the element list. The list is the single owner of its elements: it builds them on demand and discards them when the input shrinks.

  ## Constructor signature

  ```ts
  // Before
  const list = FormList([FormUnit(0), FormUnit(1), FormUnit(2)]);

  // After
  const list = FormList((input: number, index: number) => FormUnit(input), {
    initial: [0, 1, 2],
  });
  ```

  The factory receives the slot's input value and its index, and must return a `SignalForm`. It is invoked when the list materializes a new slot (initial construction, `setInput` growth, `reset` re-creation).

  ## Options

  - `initial` defaults to `[]` (was: derived from the elements array).
  - `input` defaults to `initial` (was: derived from the elements array).
  - When both `initial` and `input` are provided, `input` is applied first and the setter form sees `initial = []` at that moment — pass arrays (not functions) if you need both.

  ## `setInput` / `setInitial` change the list length

  Both methods now treat their argument as the full desired list. Extra slots are created via the factory; missing trailing slots are dropped.

  ```ts
  const list = FormList((n: number) => FormUnit(n), { initial: [0, 1, 2] });

  list.setInput([0, 1, 2, 3, 4]); // grows to 5 elements via the factory
  list.setInput([0]); // trims back to 1 element
  ```

  The input setter type lost its `undefined` holes: returning `[undefined, 5, undefined]` from a setter no longer means "leave slots 0 and 2 alone". To update a single element, call `list.getElements(monitor).at(index)!.setInput(...)` instead.

  ```ts
  // Before
  list.setInput((prev) => prev.map((v, i) => (i === 1 ? 5 : undefined)));

  // After
  list.getElements(monitor).at(1)!.setInput(5);
  ```

  ## Migration checklist

  1. Replace the elements array with a factory.
  2. If you used `undefined` holes in `setInput` / `setInitial` setters, switch to per-element setters or return a full array.
  3. If you previously called `setElements` to grow/shrink the list, `setInput` / `setInitial` can do that directly now.

- [#1078](https://github.com/owanturist/signal/pull/1078) [`1e9a426`](https://github.com/owanturist/signal/commit/1e9a426d463c8d2d5e3cfe2e40a07044e4d91572) Thanks [@owanturist](https://github.com/owanturist)! - `FormList.reset()` no longer restores list-level `validateOn` overrides applied to retained elements. After reset, every element uses whatever `validateOn` the factory returns. Element-level `setInitial` overrides continue to survive reset as before. This is a known regression compared to 0.1.x and is tracked in [#872](https://github.com/owanturist/signal/issues/872).

  ## Migration

  If you call `list.setValidateOn(...)` and expect that strategy to survive a subsequent `list.reset()`, either re-apply it after reset or bake it into the factory:

  ```ts
  // Before — list-level setValidateOn used to survive reset
  const list = FormList((n: number) => FormUnit(n, { schema: z.number() }), {
    initial: [0, 1, 2],
  });

  list.setValidateOn("onInit");
  list.reset();
  list.getValidateOn(monitor); // was "onInit"; now reverts to the factory default

  // After — pick one of:

  // (a) re-apply after reset
  list.reset();
  list.setValidateOn("onInit");

  // (b) bake the strategy into the factory
  const list = FormList(
    (n: number) => FormUnit(n, { schema: z.number(), validateOn: "onInit" }),
    { initial: [0, 1, 2] }
  );
  ```

  No migration is needed for `setTouched`, `setError`, or per-element `setInitial`.

- [#1078](https://github.com/owanturist/signal/pull/1078) [`1e9a426`](https://github.com/owanturist/signal/commit/1e9a426d463c8d2d5e3cfe2e40a07044e4d91572) Thanks [@owanturist](https://github.com/owanturist)! - Drop `FormShape` metadata field support. Every field passed to `FormShape({...})` must now be a `SignalForm` instance; previously plain values (numbers, strings, arrays, etc.) were allowed and surfaced as read-only accessors on `shape.fields` and merged into `getInput` / `getInitial` / `getOutput` payloads. Shapes like `FormShape({ id: 1, name: FormUnit("") })` are now a compile error, and the `FormMeta` type export is removed.

  ## Migration

  Move metadata out of the shape — keep static values as plain variables and reactive values as a sibling `Signal`, then merge at the read site.

  ```ts
  // Before
  const shape = FormShape({
    id: 123,
    name: FormUnit(""),
  })

  shape.getInput(monitor) // { id: 123, name: "" }

  // After
  const id = 123
  const shape = FormShape({
    name: FormUnit(""),
  })

  { id, ...shape.getInput(monitor) } // { id: 123, name: "" }
  ```

  If you imported the `FormMeta<T>` type, replace it with `(monitor: Monitor) => T` or the appropriate `Signal<T>` / `ReadonlySignal<T>` type.

## 0.1.1

### Patch Changes

- [#1075](https://github.com/owanturist/signal/pull/1075) [`34fe06a`](https://github.com/owanturist/signal/commit/34fe06a073e03aa29bbcf13955cd92949a93a866) Thanks [@owanturist](https://github.com/owanturist)! - Fix `FormSwitch` verbose output collapsing nested composite branches to their concise shape. `FormSwitchState._outputVerbose` was reading each branch's concise `_output` instead of `_outputVerbose`, so any branch that was itself a `FormSwitch`/`FormShape`/`FormList`/`FormOptional` rendered concisely when reached from a parent switch — even though reading the same node directly produced the verbose shape. Closes [#1071](https://github.com/owanturist/signal/issues/1071).

- [#1077](https://github.com/owanturist/signal/pull/1077) [`98110ca`](https://github.com/owanturist/signal/commit/98110ca5fcdbdfffa226e32a9b2a6cbeb677df15) Thanks [@owanturist](https://github.com/owanturist)! - Fix `FormUnit` accepting multiple output functions at the type level. Previously TypeScript silently allowed combinations like `{ transform, validate }`, `{ transform, schema }`, or `{ validate, schema }`, but at runtime only one was applied (priority: `schema` > `validate` > `transform`) — the others were silently ignored. `FormUnitTransformedOptions`, `FormUnitValidatedOptions`, and `FormUnitSchemaOptions` are now mutually exclusive: passing more than one of `transform`/`validate`/`schema` is a compile error. `validateOn` is also rejected on transform-only options, since the transform branch has no validation lifecycle. Runtime behavior is unchanged. Closes [#912](https://github.com/owanturist/signal/issues/912).

## 0.1.0

### Minor Changes

- [#1054](https://github.com/owanturist/signal/pull/1054) [`28e7915`](https://github.com/owanturist/signal/commit/28e79152c7ba74ed47a6abcebdb0d7af467cb01c) Thanks [@owanturist](https://github.com/owanturist)! - Initial release of `@owanturist/signal-form` and `@owanturist/signal-react` packages.
