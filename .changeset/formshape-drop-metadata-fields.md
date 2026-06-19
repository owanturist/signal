---
"@owanturist/signal-form": minor
---

Drop `FormShape` metadata field support. Every field passed to `FormShape({...})` must now be a `SignalForm` instance; previously plain values (numbers, strings, arrays, etc.) were allowed and surfaced as read-only accessors on `shape.fields` and merged into `getInput` / `getInitial` / `getOutput` payloads. Shapes like `FormShape({ id: 1, name: FormUnit("") })` are now a compile error, and the `FormMeta` type export is removed.

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
