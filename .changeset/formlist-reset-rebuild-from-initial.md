---
"@owanturist/signal-form": minor
---

`FormList.reset()` no longer restores list-level `validateOn` overrides applied to retained elements. After reset, every element uses whatever `validateOn` the factory returns. Element-level `setInitial` overrides continue to survive reset as before. This is a known regression compared to 0.1.x and is tracked in [#872](https://github.com/owanturist/signal/issues/872).

## Migration

If you call `list.setValidateOn(...)` and expect that strategy to survive a subsequent `list.reset()`, either re-apply it after reset or bake it into the factory:

```ts
// Before — list-level setValidateOn used to survive reset
const list = FormList((n: number) => FormUnit(n, { schema: z.number() }), {
  initial: [0, 1, 2],
})

list.setValidateOn("onInit")
list.reset()
list.getValidateOn(monitor) // was "onInit"; now reverts to the factory default

// After — pick one of:

// (a) re-apply after reset
list.reset()
list.setValidateOn("onInit")

// (b) bake the strategy into the factory
const list = FormList(
  (n: number) => FormUnit(n, { schema: z.number(), validateOn: "onInit" }),
  { initial: [0, 1, 2] },
)
```

No migration is needed for `setTouched`, `setError`, or per-element `setInitial`.
