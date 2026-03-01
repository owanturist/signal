# TODO

- [ ] Migrate routing to file-based routing conventions (https://reactrouter.com/how-to/file-route-conventions). This will require renaming `docs-md-root.tsx` to `docs.md.tsx`.
- [ ] Does it make sense to merge `.d.ts` files (`virtual.d.ts` and `mdx.d.ts`) into one?
- [x] The docs env does not use next anymore, so next-themes must be changed to a different theme solution (custom one is fine).
- [ ] @owanturist/signal is library from THIS project - it does not require mention.
- [ ] is it possible to colocate all routes/_index.tsx files in a single directory rather than scattering them across src/routes/?
- [ ] is there any indication in the generated .html files that they have .md version for llms?
- [ ] it does not make sense to list vite plugins here, instead move it to the Vite config section and describe it in more detail (what each plugin does, why it's needed, etc.)
- [ ] I see some artefacts of Next.js project. Make sure they are all gone/replaced.
- [ ] do not explain sandpack integration here - move the description to the source code and link it in the tech stack list.
- [ ] more general item is to NOT mention too much details of certain setup (similar to sandpack, vite plugins items above) but instead move the detailed explanations to the source code and link them from this doc (tech stack section if possible). This doc should be more of an overview and reference, not a step-by-step explanation of every part of the codebase.
---

# Docs Site Environment Reference

This document describes the architecture, build pipeline, and conventions of the documentation site located in `docs/`. It covers only technical and architectural details - it does not describe or enumerate documentation content (page titles, example names, MDX file contents, etc.).

## 1. Tech Stack

| Package                       | Role                                                                          |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `react`                       | UI runtime                                                                    |
| `react-router`                | File-based routing, loaders, prerendering                                     |
| `vite`                        | Build tool and dev server                                                     |
| `tailwindcss`                 | CSS utility framework (v4 - no config file needed)                            |
| `fumadocs`                    | Documentation framework: source loader, MDX processing, UI components, search |
| `@codesandbox/sandpack-react` | In-browser code editor and preview                                            |
| `@owanturist/signal`          | Local workspace package - used by Sandpack examples at runtime                |

## 2. Project Structure

```
docs/
  vite.config.ts                      # Vite plugin pipeline, path aliases, custom plugins
  react-router.config.ts              # React Router config: SSR mode, prerender list, app directory
  source.config.ts                    # Fumadocs MDX processing: syntax themes, inline code hints, plugins
  content/                            # MDX documentation pages and co-located example files
  src/
    root.tsx                          # Application shell: HTML skeleton, RootProvider, global styles import
    entry.server.tsx                  # Server-side rendering entry: renderToString for prerendering
    source.ts                         # Fumadocs source loader adapter wrapping generated .source/server module
    styles.css                        # Global CSS: Tailwind 4, fumadocs theme imports, .typedef component
    tools/                            # Utility functions (LLM text generation, className helpers, hooks)
    components/
      mdx-components.tsx              # MDX component registry: static set + factory with auto-resolved Sandpack dir
      sandpack/                       # Sandpack integration: glob-loads .example files, lazy editor, templates
    routes/                           # React Router route files (file-based routing conventions)
```

## 3. Build System

### Vite plugin pipeline

The plugin order in `docs/vite.config.ts` matters. The five plugins are registered in this sequence:

1. **`mdx()`** (fumadocs-mdx/vite) - Processes MDX content files, generates the `.source/` directory with page metadata, bodies, and processed markdown. Receives the `docs` collection and the default config from `source.config.ts`.
2. **`tailwindcss()`** (@tailwindcss/vite) - Tailwind 4 integration; scans source files for utility classes at build time.
3. **`reactRouter()`** (@react-router/dev/vite) - Provides file-based routing, code splitting, prerendering, and the dev server.
4. **`localPackagesPlugin()`** - Custom plugin that creates a `virtual:local-packages` module containing the built source of `@owanturist/signal` and `@owanturist/signal-react` as Sandpack-compatible file objects. Reads each package's `dist/` directory and `package.json` at build time.
5. **`generateMdFilesPlugin()`** - Custom post-build plugin that generates static `.md` files for every docs page. Runs only during the SSR build pass (see section 6 for details).

### Build target and aliases

The build target is `esnext` (no downleveling). Two path aliases are configured, mirrored in both `vite.config.ts` and `tsconfig.json`:

- `@/` resolves to `docs/src/`
- `~/tools/` resolves to `packages/tools/src/`

### source.config.ts import pattern

The fumadocs MDX Vite plugin requires both a default export (the global MDX config) and a named export for each content collection. In `docs/source.config.ts`, `defineConfig()` is the default export and `docs` is a named export from `defineDocs()`. The Vite config imports both and passes them as `mdx({ docs, default: sourceConfigDefault })`.

### SSR mode

`react-router.config.ts` sets `ssr: false`. This means the site is fully statically prerendered - there is no runtime Node.js server. The React Router build produces static HTML files for every route returned by `prerender()`.

### Prerender route discovery

The `prerender()` function in `react-router.config.ts` uses `getMdxRoutes()` to recursively scan `docs/content/docs/` for `.mdx` files and convert them to URL paths. The full prerender list is: `/`, `/llms.txt`, `/llms-full.txt`, every MDX-derived docs route, and `/docs.md` (appended last).

## 4. Application Shell

### entry.server.tsx

Uses `renderToString` from `react-dom/server` to produce static HTML during the prerender build. This is the simplest possible server entry - no streaming, no progressive rendering. It sets `Content-Type: text/html` and prepends `<!DOCTYPE html>`.

### root.tsx

Exports two things, both required by React Router:

- **`Layout`** - The outer HTML document structure (`<html>`, `<head>`, `<body>`) with React Router's `<Meta>`, `<Links>`, `<Scripts>`, and `<ScrollRestoration>`. Sets `suppressHydrationWarning` on `<html>` for theme script injection. Imports `@/styles.css` as a side effect.
- **`App`** (default export) - Wraps the route outlet in fumadocs `RootProvider` from `fumadocs-ui/provider/react-router`. Configures search with `type: "static"` (client-side static search index, no server API needed).

## 5. Route Architecture

The site uses React Router file-based routing conventions. Route files live in `docs/src/routes/`.

| Path             | Type               | Purpose                                                                                  |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------- |
| `/`              | Component          | Landing page with feature demos using inline MDX snippets                                |
| `/docs`          | Layout             | Wraps all `/docs/*` child routes in `DocsLayout` with sidebar navigation                 |
| `/docs/**`       | Component + Loader | Renders individual doc pages (component branch) or returns `.md` content (loader branch) |
| `/docs.md`       | Resource           | Returns the docs index page as markdown                                                  |
| `/llms.txt`      | Resource           | Returns a page index linking to individual `.md` files                                   |
| `/llms-full.txt` | Resource           | Returns all doc pages concatenated as plain text                                         |

### Resource route pattern

Routes that export only a `loader` function (no default component export) are resource routes. React Router serves them as raw responses rather than rendering them into the HTML shell. The resource routes for `/docs.md`, `/llms.txt`, and `/llms-full.txt` all follow this pattern - they return `Response` objects with text or markdown content types.

### The docs splat route dual behavior

The docs splat route serves two purposes through a single splat parameter:

- **HTML branch** (default export): When the URL has no `.md` extension, the component renders the MDX page using fumadocs `DocsPage`, `DocsTitle`, `DocsDescription`, and `DocsBody` components. The loader returns an empty object `{}` in this case.
- **Markdown branch** (loader): When the URL ends in `.md`, the loader strips the extension, looks up the page via `source.getPage()`, and returns a `Response` with `Content-Type: text/markdown; charset=utf-8`.

However, there is a fundamental React Router limitation: because the route has a default component export, React Router always treats it as a component route during prerendering. Even when the loader returns a `Response`, React Router wraps it in the HTML shell instead of serving the raw response. This means the `.md` URLs cannot be prerendered through normal means. The `generateMdFilesPlugin` works around this limitation (see section 6).

## 6. LLM / Markdown Endpoints

### /llms.txt

- **Content-Type**: `text/plain; charset=utf-8`
- **Content**: A structured index page with the project title, description, and a list of all doc pages. Each entry links to the page's `.md` URL (e.g., `/docs/api/signal.md`) with an optional description. Ends with a link to `/llms-full.txt` for the complete content.
- **Data source**: `source.getPages()` provides the page list; titles and descriptions come from frontmatter.

### /llms-full.txt

- **Content-Type**: `text/plain; charset=utf-8`
- **Content**: Every doc page's full processed markdown, concatenated with double newlines. Each page section includes YAML frontmatter (title, description, url, lastModified) and the processed markdown body.
- **Data source**: `source.getPages()` mapped through `getLLMText()`.

### /docs.md

- **Content-Type**: `text/markdown; charset=utf-8`
- **Content**: The docs index page (`source.getPage([])`) rendered as markdown via `getLLMText()`.

### /docs/**/*.md

- **Content-Type**: `text/markdown; charset=utf-8`
- **Served by**: The docs splat route loader at runtime (detects `.md` extension in the splat parameter and returns a markdown `Response`). Also written as static files to `docs/dist/client/` during the build by `generateMdFilesPlugin` — this is a prerendering workaround because React Router cannot prerender `.md` variants of routes that also have a default component export. Static hosting therefore serves the pre-generated `.md` files without hitting any server.
- **Content**: Each individual doc page as markdown with frontmatter, identical to what the loader would return for `.md` requests.

### getLLMText helper

Located at `docs/src/tools/get-llm-text.ts`. Accepts a fumadocs page object and returns a markdown string. It calls `data.getText("processed")` to get the processed markdown content (this requires `includeProcessedMarkdown: true` in the fumadocs docs collection config). It prepends YAML frontmatter with title, description, url, and lastModified, followed by a level-1 heading and the processed body.

### generateMdFilesPlugin mechanism

**Why it exists**: React Router cannot prerender the `.md` variant of a route that also has a default component export. When the docs splat route exports both a loader and a component, React Router always renders the component into HTML during prerendering, ignoring the `Response` returned by the loader for `.md` URLs.

**What it does**: The plugin runs as a Vite `writeBundle` hook during the SSR build pass only. After the server bundle has been written to `docs/dist/server/index.js`, the plugin:

1. Dynamically imports the compiled server bundle.
2. Locates the docs splat route module by its route ID.
3. Scans `docs/content/docs/` for all `.mdx` files using `getMdxRoutes()`.
4. For each page (excluding `/docs` itself, which is handled by the `/docs.md` resource route), calls the route's loader directly with a synthetic `Request` and the appropriate splat parameter.
5. Writes each `Response` body as a static file to `docs/dist/client/` (e.g., `dist/client/docs/api/signal.md`).

This bypasses the React Router HTTP handler entirely, calling the loader function as a plain async function. The resulting `.md` files are served as static assets by any file-based hosting.

**Implementation**: `docs/vite.config.ts`, in the `generateMdFilesPlugin()` and `generateMdRoute()` functions.

## 7. Fumadocs Integration

### source.config.ts

Located at `docs/source.config.ts`. Configures two things:

- **`defineDocs()`** (named export `docs`): Declares the content collection rooted at `content/docs`. Sets `includeProcessedMarkdown: true` in `postprocess`, which is required for the `data.getText("processed")` call in `getLLMText()`.
- **`defineConfig()`** (default export): Global MDX processing options. Adds the `lastModified` plugin (populates `data.lastModified` from git history). Configures `rehypeCode` with `github-light`/`github-dark` themes and `inline: "tailing-curly-colon"` for inline code language hints (e.g., `` `Type{:dart}` ``). Includes the default fumadocs transformers for Shiki code annotations.

### source.ts

Located at `docs/src/source.ts`. Wraps the generated `.source/server` module with the fumadocs `loader()` utility, setting `baseUrl: "/docs"`. The resulting `source` object exposes three methods used throughout the codebase:

- `source.getPage(slugArray)` - Returns a single page by its slug segments (e.g., `["api", "signal"]`)
- `source.getPages()` - Returns all pages in the collection
- `source.pageTree` - The hierarchical page tree used by `DocsLayout` for sidebar navigation

### The .source/ directory

Generated automatically by `fumadocs-mdx` during the build (or dev server startup). Contains compiled MDX modules, page metadata, and the `server` entry point imported by `source.ts`. This directory is not committed to version control.

## 8. MDX Components

File: `docs/src/components/mdx-components.tsx`

Exports a static `MDXComponents` object containing the default fumadocs UI MDX components plus `Accordion`, `Accordions`, `TypeTable`, and `Sandpack`.

Also exports a `createMDXComponents(filePath)` factory that returns the same component set but with `Sandpack` pre-filled: it extracts the directory from `filePath` and passes the result as the `dir` prop. This means MDX content files can write `<Sandpack />` with no props and have the dir automatically resolve to their own directory.

## 9. Sandpack Integration

The full data flow from disk to browser editor:

### Step 1: Glob all example files

`import.meta.glob` eagerly loads two sets of files at build time:

- `/content/**/*.example.{ts,tsx}` - All example files from the content directory, imported as raw strings
- `/src/components/sandpack/*.example.tsx` - Template files (entry point and render boundary), also as raw strings

### Step 2: Strip example metadata

The `stripExampleMeta()` function removes three things from the raw source before display:

- The `// @ts-nocheck` line at the top (present so VS Code does not report errors in unresolved imports)
- `//#region code` markers
- `//#endregion code` markers

### Step 3: Resolve dir to file set

When a `<Sandpack dir="docs/tutorials/composing-state" />` is rendered, `getExampleFiles()` filters the global content examples for paths starting with `/content/docs/tutorials/composing-state/`. Each matching path has its `/content/{dir}/` prefix and `.example` segment stripped to produce the Sandpack virtual filesystem path (e.g., `/content/docs/tutorials/composing-state/align/state.example.ts` becomes `/align/state.ts`).

### Step 4: Inject local packages

The `virtual:local-packages` Vite virtual module provides pre-built `@owanturist/signal` and `@owanturist/signal-react` as Sandpack file objects. The `localPackagesPlugin` in `vite.config.ts` reads each package's `dist/` directory and `package.json`, then exports them as hidden files under `/node_modules/`.

### Step 5: Merge file sets

The final Sandpack file set is assembled by merging in this order (later entries override earlier ones):

1. Template files (`/index.tsx` hidden entry point, `/render-boundary.tsx` utility)
2. Local package files (hidden `/node_modules/` entries)
3. Dir-loaded example files (from `getExampleFiles()`)
4. Explicit `files` prop (if provided by the MDX author)

### Step 6: Lazy-loaded editor

The editor component lazy-loads the actual Sandpack and `react-resizable-panels` libraries via `React.lazy()`. This avoids loading the editor bundle during SSR or on pages that do not use Sandpack. The layout uses `react-resizable-panels` with a horizontal split (file explorer | main panel) and a vertical split within the main panel (code editor | preview). The theme follows the site theme via a custom `useTheme` hook.

## 10. Styling

Three CSS imports in `docs/src/styles.css`:

1. `@import "tailwindcss"` - Tailwind 4 base styles and utilities. Tailwind 4 requires no config file; it is integrated entirely through the `@tailwindcss/vite` plugin.
2. `@import "fumadocs-ui/css/solar.css"` - The solar color theme for fumadocs UI components.
3. `@import "fumadocs-ui/css/preset.css"` - Base fumadocs UI preset styles.

One custom component class is defined in the `@layer components` block:

- **`.typedef`** - Used in API reference pages to style parameter and return-value documentation blocks. Adds a left border, removes default list markers, collapses spacing between list items and horizontal rules, adjusts inline code line height, and provides grid layout for `@example` tags that contain code figures.

## 11. TypeScript Configuration

`docs/tsconfig.json` extends the monorepo root `tsconfig.json` and overrides several settings:

- **`target: "ESNext"`** and **`lib: ["DOM", "DOM.Iterable", "ESNext"]`** - Browser environment with latest language features.
- **`types: ["vite/client"]`** - Needed for `import.meta.glob`, `import.meta.dirname`, and other Vite-specific APIs.
- **`verbatimModuleSyntax: false`** - Required because React Router generates dynamic imports that are incompatible with verbatim module syntax enforcement.
- **`paths`** - `@/*` maps to `./src/*` and `~/tools/*` maps to `../packages/tools/src/*`, mirroring the Vite resolve aliases.
- **`include: ["**/*.ts", "**/*.tsx", "**/*.mdx"]`** - Includes MDX files for type checking.
- **`resolveJsonModule: true`** - Allows importing JSON files (used by the local packages plugin).
- **`incremental: true`** - Speeds up repeated type checks.

## 12. Linting

The root `biome.jsonc` contains several overrides that apply to docs files. Each override exists to accommodate patterns that are normal in the docs environment but would be flagged in library source code.

### docs/**/*.{ts,tsx,mjs,jsx}

Applies to all docs source files:

- `noDefaultExport: "off"` - React Router routes and config files require default exports.
- `useComponentExportOnlyModules: "off"` - Docs modules often mix component and non-component exports (e.g., `loader` + default component in route files).
- `useExportsLast: "off"` - React Router patterns place exports throughout the file.

### docs/*.{ts,tsx} and docs/src/**

Two overlapping overrides apply to config files and all docs source:

- `noNodejsModules: "off"` - Config files and some source files use Node.js built-in modules like `fs` and `path`.
- `noHeadElement: "off"` - React Router apps use the native `<head>` element in the root layout rather than a framework-specific component.
- `noJsxLiterals: "off"` - Landing page and docs components use literal strings in JSX.

### docs/*.{mjs,ts} (config files specifically)

Part of the broader "dev env" override:

- `useNamingConvention: "off"` - Config files may use naming conventions dictated by external APIs.
- `noDefaultExport: "off"` - Config files typically require default exports.
- `noConsole: "off"` - Build plugins use `console.info` and `console.warn` for logging.

### docs/src/routes/**/*.{ts,tsx}

- `useFilenamingConvention: "off"` - React Router uses dot notation in filenames as path separators (e.g., `docs.$.tsx` maps to `/docs/*`). These filenames would otherwise violate the default naming convention rules.

### docs/content/**/*.example.{ts,tsx}

Applies to Sandpack example files co-located with MDX content:

- `noMagicNumbers: "off"` - Example code uses inline numeric values for clarity.
- `noUndeclaredDependencies: "off"` - Examples import from `@owanturist/signal` and `@owanturist/signal-react`, which are workspace packages not listed in `docs/package.json` dependencies in the standard way.
- `noJsxLiterals: "off"` - Example code uses literal strings in JSX for readability.
