---
"@owanturist/signal-form": patch
---

Fix `FormSwitch` verbose output collapsing nested composite branches to their concise shape. `FormSwitchState._outputVerbose` was reading each branch's concise `_output` instead of `_outputVerbose`, so any branch that was itself a `FormSwitch`/`FormShape`/`FormList`/`FormOptional` rendered concisely when reached from a parent switch — even though reading the same node directly produced the verbose shape. Closes [#1071](https://github.com/owanturist/signal/issues/1071).
