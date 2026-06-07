# FormList factory/initialInputs review — unresolved items

Findings from the review of the factory/`initialInputs` rewrite on `form-list-fabric`
that were **not** fixed inline. The two correctness bugs that were fixed (`_dirtyOn`
coercing structured child flags to `true`, and `setInput` silently dropping
function-setter slots) are not listed here.

The items below are split into "intentional but worth a sanity check" and
"genuine gaps that need a bigger decision than a localized patch."

---

## 1. `_replaceInitial` ignores `isMounting`; uses `child._setInitial` for propagation

**File:** `packages/signal-form/src/form-list/_internal/form-list-state.ts:105`

**Plan reference:** step 9 — *"Drop the `isMounting` branching (no longer load-bearing —
see Behavior changes)."* (Note: the *Behavior changes* section itself does not list
this change or its consequences.)

**What changed in behavior**

Old code:

```ts
elements.at(index)?._replaceInitial(monitor, donorInitialElement, isMounting)
```

New code:

```ts
elements.at(index)?._setInitial(monitor, input)
```

`FormUnitState._setInitial` does three things that `_replaceInitial` did not:

1. Sets `_current` to the resolved value (same as before).
2. **Sets `_explicit = true` unconditionally** (`form-unit-state.ts:212`). Previously,
   `_replaceInitial` only re-flagged explicit when `_explicit && isMounting`.
3. **Bumps `_validated.write(identity)`** on every call, regardless of whether the
   value actually changed.

**Why it might matter**

- Every parent re-mount that propagates through a FormList triggers a re-validation
  cascade on every child, even when the initial value is unchanged.
- Children become "sticky-explicit" after first mount. Any later mounting flow that
  branches on the `_explicit` flag will behave differently than it did pre-change.

**Status:** intentional per the plan. Worth a second look only if mounting
semantics surface a real bug downstream. Possible mitigations if needed later:

- Add a `_setInitialPure` primitive on `SignalFormState` that writes the initial
  without touching `_explicit` / `_validated`, and call that from
  `_replaceInitial` instead.
- Cheap workaround: in the `_replaceInitial` loop, compare `input` to
  `element._initial.read(monitor)` and skip the `_setInitial` call when they match.
  Avoids spurious `_validated` bumps without abstraction changes.

---

## 2. `_reset` loses per-slot `validateOn` for slots removed before reset

**File:** `packages/signal-form/src/form-list/_internal/form-list-state.ts:473-498`

**Plan reference:** line 43 — *"List-pushed `validateOn` and `touched` per-slot values
are captured pre-reset and pushed into the fresh elements after creation."*

**What's broken**

```ts
const verboseValidateOn = this._validateOnVerbose.read(monitor)
```

`_validateOnVerbose` has length = current `elements.length`, **not**
`_initialInputs.length`. If the user shrank the list via `setElements` before calling
`reset()`, the verbose snapshot only covers the surviving elements. Indices beyond
that length fall through the `if (!isUndefined(validateOn))` guard and get
factory-default `validateOn` instead of whatever the user originally configured.

**Repro shape**

1. Build a 5-element list with mixed per-slot validateOn strategies (so
   `_validateOn` does **not** collapse to a single string).
2. `setElements(elements.slice(0, 3))`.
3. `reset()` rebuilds 5 fresh elements; indices 3 and 4 lose their original
   strategy.

The old code preserved this because per-slot validateOn lived on the
`_initialElements` snapshot, which was independent of the current elements array.

**Why it's hard to fix in place**

To preserve per-slot `validateOn` across destructive `setElements`, the list would
need to track validateOn on its own state (not just delegate to children). That's
an architectural change — likely an `_initialValidateOn: Signal<ReadonlyArray<...>>`
alongside `_initialInputs`, kept in sync by `_setValidateOn`.

**Related minor deviation from plan:** the plan said capture `touched` too. The
implementation explicitly drops it with the comment *"reset is supposed to clear
touched state."* That's a defensible choice and matches typical reset semantics,
but it's still a quiet divergence from the plan if anyone re-reads it later.

---

## 3. `_childOf` runs the factory then immediately discards the results

**File:** `packages/signal-form/src/form-list/_internal/form-list-state.ts:70-86`

**Plan reference:** step 10 — exactly this pattern (construct via `_initialInputs`,
then override `_elements` with clones).

```ts
const child = new FormListState<TElement>(
  parent,
  this._factory,
  this._initialInputs.read(monitor),
)
// constructor above invokes factory(input, index) for every input...

const clonedElements = map(this._elements.read(monitor), (element) =>
  child._parentOf(element._clone()),
)
child._elements.write(clonedElements)  // ...immediately discarded here.
```

**Cost**

- O(N) wasted factory invocations per clone. Pays out on every `_clone()` —
  FormSwitch branch handoffs, nested-FormList initial snapshots, anywhere `_childOf`
  is invoked.
- If the user's factory has observable side effects (auto-incremented IDs,
  listener registration, telemetry calls, allocation-heavy element construction),
  those side effects fire on every clone for elements that are immediately thrown
  away.

**Status:** intentional per the plan. If it becomes a real cost, the fix is to
add a private constructor path on `FormListState` that takes an explicit
`_elements` value and skips the factory loop — used only by `_childOf`. The public
constructor stays factory-based.

---

## 4. `_dirtyOnVerbose` truncates instead of padding (implementation ↔ plan disagreement)

**File:** `packages/signal-form/src/form-list/_internal/form-list-state.ts:454-463`

**Plan reference:** line 45 + step 7 — *"Verbose dirty signal returns a sentinel
(`true`) rather than reconstructing the child's nested verbose shape"* and
*"append `true` per missing slot."*

**What was actually built**

```ts
const length = Math.min(initialInputsLength, elements.length)
return map(elements.slice(0, length), ({ _dirtyOnVerbose }) => _dirtyOnVerbose.read(monitor))
```

The implementation **truncates** to `min(initialInputsLength, elements.length)`
instead of padding to `initialInputsLength`. Same for `_dirtyVerbose`, which only
iterates over current elements.

The tests were updated to match the implementation, not the plan
(`is-dirty.spec.ts:556`, `:610`: *"verbose dirty no longer reports removed-tail
slots"*). The asymmetry between `_dirtyVerbose` (length = elements.length) and
`_dirtyOnVerbose` (length = min(initialInputsLength, elements.length)) is now
load-bearing for those tests.

**What needs deciding**

Either:

- **Plan wins** — pad both verbose signals with `true` sentinels for removed
  slots; update `is-dirty.spec.ts` expectations accordingly. This restores the
  plan's documented mental model that verbose-length always equals the larger of
  current/initial.
- **Code wins** — update the plan to match the implementation. Document the
  asymmetry between `_dirtyVerbose` and `_dirtyOnVerbose` lengths explicitly, since
  consumers that zip the two will silently lose entries.

Not something to silently flip in either direction without an explicit call.
