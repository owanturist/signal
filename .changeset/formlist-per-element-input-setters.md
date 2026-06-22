---
"@owanturist/signal-form": minor
---

`FormList.setInput` / `setInitial` / `reset` now accept per-element setters inside the array, and `FormListOptions.initial` / `input` are restricted to plain value arrays (no callback at the options level).

## `setInput` / `setInitial` / `reset` accept per-element setters

Each slot of the array argument may now be either a raw input value or a `Setter<TInput, [TInput, TInput]>` — the same setter shape an individual element's `setInput` accepts. The top-level callback form (a function that returns the full array) still works.

```ts
const list = FormList((n: number) => FormUnit(n), { initial: [0, 1, 2] })

// Before: only raw values were allowed inside the array.
list.setInput([10, 20, 30])

// After: per-slot setters are allowed too.
list.setInput([10, (prev) => prev + 1, 30])
```

## `FormListOptions.initial` / `input` no longer accept a callback

The options-level `initial` and `input` are now typed as `FormListInput<TElement>` (a plain `ReadonlyArray<TInput>`), not `FormListInputSetter<TElement>`. There is no prior state to feed a callback at construction time, so the callback form is gone.

```ts
// Before: callback was accepted (and was always called with `[]`).
FormList((n: number) => FormUnit(n), {
  initial: (prev) => prev.concat([1, 2, 3]),
})

// After: pass the array directly.
FormList((n: number) => FormUnit(n), {
  initial: [1, 2, 3],
})
```
