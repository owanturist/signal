---
"@owanturist/signal-form": minor
---

Revert per-element setter shape from `FormListInputSetter`. Each slot of `FormList.setInput` / `setInitial` / `reset` is now a plain input value again — the same shape as before the previous release. The top-level callback form (a function that returns the full array) is unchanged.

The per-element setter form was unsound for the factory growth path: a partial setter (e.g. `{ first: 2 }` for a `FormShape` element) typechecked at the list level but produced a malformed slot when it reached the factory, which expects a full `GetFormInput<TElement>`. Without a way to type-distinguish "patch existing slot" from "grow new slot", the safer shape is plain inputs.

```ts
const list = FormList(
  (input: { first: number; second: string }) =>
    FormShape({ first: FormUnit(input.first), second: FormUnit(input.second) }),
  { initial: [{ first: 1, second: "1" }] },
)

// Before: per-slot setter was accepted (and could be partial)
list.setInitial([{ first: 2 }])

// After: each slot must be a full input
list.setInitial([{ first: 2, second: "2" }])
```

To update a single element without touching the rest, use the element's own setter:

```ts
list.getElements(monitor).at(0)!.setInitial({ first: 2, second: "2" })
```
