// Internal re-export used by `staticFilesPlugin` in `vite.config.ts` to extract
// the page source and LLM-formatted text for post-build .md/.txt file
// generation. The plugin runs a separate `vite.build()` against this entry,
// then dynamically imports the bundled output. We re-export from this file
// (rather than calling `ssrLoadModule` on `source.ts` directly) because Vite's
// dev server always sets `environment.mode === "dev"`, which causes
// `fumadocs-mdx` to compile MDX with the `jsxDEV` runtime - that runtime is
// absent from the production React used by the SSR build, causing crashes.
// Running a proper `vite.build()` sets `environment.mode === "build"` so MDX
// compiles with the standard `jsx` runtime.
//
// This file is NOT a TanStack route - it's a private bundling target.
export { source } from "./source"
export { getLLMText } from "./tools/get-llm-text"
