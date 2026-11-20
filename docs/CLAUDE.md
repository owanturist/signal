# Documentation Site

Architecture reference for the docs site (build system, routing, plugins, integrations): [`.claude/docs-env.md`](../.claude/docs-env.md).

`@owanturist/signal/monitor-factory` is an internal integration API used by `signal-react` - do not document it publicly.

## Documentation Standards

All documentation content in `docs/content/` **must** follow the [Diataxis framework](../.claude/skills/writing-documentation-with-diataxis/SKILL.md). Every documentation page must clearly belong to one of the four Diataxis types:

- **Tutorials** -- learning-oriented, guide the reader through doing something step-by-step
- **How-to guides** -- task-oriented, provide steps to solve a specific problem
- **Reference** -- information-oriented, describe the API surface accurately and completely
- **Explanation** -- understanding-oriented, clarify concepts and provide context

Do not mix types within a single page. When writing or reviewing documentation, use the Diataxis compass to classify content: (1) does it inform action or cognition? (2) does it serve acquisition or application? See the [writing-documentation-with-diataxis](../.claude/skills/writing-documentation-with-diataxis/SKILL.md) skill for detailed guidance.

### Writing Style

**Dashes:**
- Use ` - ` (space, hyphen, space) in prose — never use `--` and never use `—` (em dash)
- Example: "Batches can be nested - the outermost batch controls when notifications fire."

**Capitalization:**
- `Signal` is always capitalized in prose, whether referring to the concept or the class
- `React` is always capitalized
- API names (`useMonitor`, `useComputed`, `FormUnit`, etc.) must never appear as plain text in prose — always format them as inline code with the `{:ts}` language hint: `` `useMonitor{:ts}` ``

**Canonical terminology:**
- Use **"consumer"** for the thing that depends on a signal and re-runs or re-renders when it changes — aligned with Angular and the Reactive Streams spec
- Do not use "watcher", "dependent", "subscriber", or "observer" for this concept
- Effects, derived signals, `useComputed{:ts}`, and `useMonitor{:ts}` are all types of consumers
- Use **"derived signal"** (not "computed signal" or "read-only signal") when referring to signals created from other signals in prose — "computed" is acceptable only when comparing to other frameworks that use that term

**Immutability in prose:**
- The preference for `ReadonlyArray`, `ReadableSignal` and other immutable types applies to code only. In descriptions say "a Signal array of items", not "a read-only array" - mention readability or read-only-ness only when it matters to what the page teaches

**Hyphenation:**
- Always hyphenate: `re-run`, `re-runs`, `re-render`, `re-renders`, `re-compute` — never write `rerun`, `rerender`, `recompute`

**Tone by page type:**
- **Guides and tutorials** — conversational, second-person ("you"), imperative ("call `batch(){:ts}`"), contractions allowed ("don't", "you've")
- **API reference** — formal, third-person or impersonal ("the function returns…"), no contractions, imperative only for step instructions

### API Reference docs/ Style Guide

API reference pages use these conventions. For fumadocs MDX syntax details see the [fumadocs skill](../.claude/skills/fumadocs/SKILL.md).

**Page intro:**
- Every API reference page must open with a single sentence describing the API before the first `##` heading
- The intro goes between the frontmatter and the first `##` heading
- Keep it to one sentence — the `##` headings and parameter docs carry the detail

**Frontmatter:**
- Every page needs `title` and `description` in YAML frontmatter
- The `title` renders as the page heading; do **not** add a separate `# h1`

**Page structure:**
- Each API entry gets an `##` heading with the signature in inline code and a custom anchor: `` ## `Signal(initialValue, options?){:dart}` [#signal-factory] ``
- Custom anchors use the fumadocs `[#custom-id]` syntax (appended to the heading)
- A fenced code block with the full TypeScript signature immediately follows the heading
- A short prose description follows the signature block
- Parameters and return value are listed inside `<section className="typedef">` ... `</section>`

**Inside `<section className="typedef">` (mimics JSDoc conventions):**
- Parameters are unordered list items prefixed with `@param`: `` - `@param name: Type{:dart}` Description ``
- Nested option fields use dot notation: `` - `@param options?.compare?: null | Compare{:dart}` ``
- A horizontal rule `---` separates parameters from the return value
- Return value uses `@returns`: `` - `@returns Type{:dart}` Description ``
- Do **not** leave blank lines between list items — blank lines cause MDX to wrap each item in `<p>` tags, adding unwanted extra spacing

**Inline code language hints** (requires `inline: "tailing-curly-colon"` in rehypeCode config)**:**
- Use `` `Type{:dart}` `` for parameter/return signatures in prose (Dart-like highlighting for readable type annotations)
- Use `` `expression{:ts}` `` for inline TypeScript expressions in prose
- The `{:lang}` suffix is stripped from rendered output

**Callouts:**
- `<Callout>` for informational notes (default type is `info`)
- `<Callout type="warn">` for warnings
- Other types available: `error`, `success`, `idea`
- Place callouts inside the relevant `@param` list item when they relate to a specific parameter
- In guide pages, pitfalls, gotchas, and common mistakes must use `<Callout type="warn">` — never describe them in plain prose

### Sandpack Example Files Convention

When a documentation page includes a `<Sandpack>` interactive editor, **example code must live in `.example.ts` / `.example.tsx` files on disk** - never as inline template literals. This ensures a single source of truth: the same files feed both the Sandpack editor and the prose code blocks.

**File structure:**
- Place example files next to the MDX page in a subdirectory matching the page slug (e.g. `docs/content/docs/tutorials/composing-signals/align/state.example.ts` for `composing-signals/index.mdx`)
- Use the `.example.ts(x)` extension to distinguish example files from real source code
- Don't create a folder for a single file: use `summary.example.tsx`, not `summary/index.example.tsx`. A folder is only for a module with several files (e.g. `counter/state.example.ts` + `counter/index.example.tsx`)
- Add `// @ts-nocheck` as the first line and wrap the actual code in `//#region code` ... `//#endregion code` markers to suppress VS Code errors while keeping rendered output clean

**Example file template:**
```ts
// @ts-nocheck

//#region code
import { Signal } from "@owanturist/signal"

// ... actual example code ...
//#endregion code
```

**Sandpack component (`docs/src/components/sandpack/index.tsx`):**
- Use the `dir` prop to load all `.example.ts(x)` files from a directory: `<Sandpack dir="docs/tutorials/composing-signals" entry="/app.tsx" />`
- The `dir` path is relative to `docs/content/`
- The `.example` segment is stripped to produce Sandpack paths (e.g. `align/state.example.ts` -> `/align/state.ts`)
- `// @ts-nocheck` and region markers are stripped automatically via `stripExampleMeta()`
- Explicit `files` prop entries override `dir`-loaded files

**Prose code blocks:**
- Use fumadocs `<include>` with the `#code` region anchor to render the same file as a code block:
  `<include lang="ts" meta='title="align/state.ts"'>./composing-signals/align/state.example.ts#code</include>`
- The `#code` region excludes the `// @ts-nocheck` line and region markers from rendered output
- Test-only code blocks that don't appear in Sandpack can remain as inline fenced blocks

**Shared Sandpack infrastructure** (also `.example.tsx` files):
- `docs/src/components/sandpack/index.example.tsx` -- Sandpack bootstrap entry point (hidden from file explorer)
- `docs/src/components/sandpack/render-boundary.example.tsx` -- `RenderBoundary` helper that flashes on re-render
- `docs/src/components/sandpack/styles.example.css` -- shared demo styles (`stack`, `row`, `panel`, `btn`, `input`, ...); use these class names in examples instead of `style` props, and keep `style` only for values computed from state
