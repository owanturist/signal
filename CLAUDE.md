# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Standards

- **Ignore cSpell diagnostics** — cSpell is enabled in the editor but Claude must not treat its spelling warnings as issues to fix.
- Define React components as constants typed with `FC` (`const Counter: FC<Props> = ({ label }) => {...}`), not as function declarations - this is also what Biome's `useReactFunctionComponentDefinition` enforces. In route files define the components above `export const Route`, since constants are not hoisted
- Prefer immutable types: `ReadonlyArray<T>`, `ReadonlySet<T>`, `ReadonlyMap<K, V>` and `readonly` properties, unless the value must be mutated. Let TypeScript infer types where it can, and annotate at boundaries such as props and return types. Arrays inside Signals are typed `ReadonlyArray` - an array doesn't notify anyone when it changes, so it is replaced through `write`, never mutated. Note that `Signal<Array<T>>` is not assignable to `Signal<ReadonlyArray<T>>`, so create the Signal with the `ReadonlyArray` type up front; a component that only reads can accept `ReadableSignal<ReadonlyArray<T>>`
- No default switch clauses (enables TypeScript exhaustiveness checks)
- Consolidate imports from the same module into a single import statement (use inline `type` qualifier instead of separate `import type` statement)

## Release Process

Uses Changesets for versioning. Add changesets with `pnpm cs` before opening PRs.

## Bash Command Paths

When running Bash commands, **always use relative paths** from the project root (or the relevant subdirectory) instead of absolute paths. Absolute paths are long, environment-specific, and harder to read.

- Correct: `cd docs && ls dist/server/`
- Correct: `pnpm --filter docs build`
- Wrong: `ls /Users/aovechkin/Projects/react-impulse/docs/dist/server/`

Note: The Read, Edit, Write, and Glob tools still require absolute paths.
