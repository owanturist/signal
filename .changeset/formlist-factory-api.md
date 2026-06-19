---
"@owanturist/signal-form": minor
---

`FormList` now takes a factory function instead of a pre-built array of elements, and `setInput` / `setInitial` may grow or shrink the element list. The list is the single owner of its elements: it builds them on demand and discards them when the input shrinks.

## Constructor signature

```ts
// Before
const list = FormList(
  [FormUnit(0), FormUnit(1), FormUnit(2)]
)

// After
const list = FormList(
  (input: number, index: number) => FormUnit(input),
  { initial: [0, 1, 2] },
)
```

The factory receives the slot's input value and its index, and must return a `SignalForm`. It is invoked when the list materializes a new slot (initial construction, `setInput` growth, `reset` re-creation).

## Options

- `initial` defaults to `[]` (was: derived from the elements array).
- `input` defaults to `initial` (was: derived from the elements array).
- When both `initial` and `input` are provided, `input` is applied first and the setter form sees `initial = []` at that moment — pass arrays (not functions) if you need both.

## `setInput` / `setInitial` change the list length

Both methods now treat their argument as the full desired list. Extra slots are created via the factory; missing trailing slots are dropped.

```ts
const list = FormList((n: number) => FormUnit(n), { initial: [0, 1, 2] })

list.setInput([0, 1, 2, 3, 4]) // grows to 5 elements via the factory
list.setInput([0])             // trims back to 1 element
```

The input setter type lost its `undefined` holes: returning `[undefined, 5, undefined]` from a setter no longer means "leave slots 0 and 2 alone". To update a single element, call `list.getElements(monitor).at(index)!.setInput(...)` instead.

```ts
// Before
list.setInput((prev) => prev.map((v, i) => (i === 1 ? 5 : undefined)))

// After
list.getElements(monitor).at(1)!.setInput(5)
```

## Migration checklist

1. Replace the elements array with a factory.
2. If you used `undefined` holes in `setInput` / `setInitial` setters, switch to per-element setters or return a full array.
3. If you previously called `setElements` to grow/shrink the list, `setInput` / `setInitial` can do that directly now.
