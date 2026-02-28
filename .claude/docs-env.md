# Docs Site Environment Reference

This document describes the architecture, build pipeline, and conventions of the documentation site located in `docs/`. It covers only technical and architectural details - it does not describe or enumerate documentation content (page titles, example names, MDX file contents, etc.).

## 1. Tech Stack

| Package | Version | Role |
| --- | --- | --- |
| `react` | ^19.2.4 | UI runtime |
| `react-dom` | ^19.2.4 | DOM renderer (includes `renderToString` for prerendering) |
| `react-router` | ^7 | File-based routing, loaders, prerendering |
| `@react-router/dev` | ^7 | Vite plugin and CLI for React Router (`react-router dev`, `react-router build`) |
| `vite` | ^7 | Build tool and dev server |
| `tailwindcss` | ^4.2.1 | CSS utility framework (v4 - no config file needed) |
| `@tailwindcss/vite` | ^4.1.18 | Vite plugin for Tailwind 4 |
| `fumadocs-core` | ^16.6.7 | Headless documentation utilities (source loader, MDX plugins, search) |
| `fumadocs-ui` | ^16.6.7 | Pre-built documentation UI components and layouts |
| `fumadocs-mdx` | 14.2.8 | MDX processing pipeline, content source generation, Vite plugin |
| `@codesandbox/sandpack-react` | ^2.19.9 | In-browser code editor and preview |
| `react-resizable-panels` | ^4.6.5 | Resizable panel layout for Sandpack editor |
| `clsx` | ^2.1.1 | Conditional className utility |
| `lucide-react` | ^0.575.0 | Icon library |
| `next-themes` | ^0.4.6 | Theme switching (light/dark/system) |
| `@owanturist/signal` | workspace:* | Local package - used by Sandpack examples at runtime |
| `@types/react` | ^19.2.14 | TypeScript types for React |
| `@types/react-dom` | ^19.2.3 | TypeScript types for React DOM |

## 2. Project Structure

```
docs/
  package.json                        # Docs-specific dependencies and scripts
  vite.config.ts                      # Vite plugin pipeline, path aliases, custom plugins
  react-router.config.ts              # React Router config: SSR mode, prerender list, app directory
  source.config.ts                    # Fumadocs MDX processing: syntax themes, inline code hints, plugins
  tsconfig.json                       # TypeScript config extending monorepo root
  content/                            # (MDX files - omitted from this tree)
  src/
    root.tsx                          # Application shell: HTML skeleton, RootProvider, global styles import
    entry.server.tsx                  # Server-side rendering entry: renderToString for prerendering
    source.ts                         # Fumadocs source loader adapter wrapping generated .source/server module
    styles.css                        # Global CSS: Tailwind 4, fumadocs theme imports, .typedef component
    virtual.d.ts                      # Type declarations for Vite virtual modules (virtual:local-packages)
    routes.ts                         # Explicit React Router route config: wires file names to URL paths via index(), route(), layout()
    mdx.d.ts                          # TypeScript declarations for importing .mdx files
    tools/
      get-llm-text.ts                # Helper to convert a fumadocs page into LLM-friendly markdown with frontmatter
      cx.ts                          # Utility: conditional className helper
      use-is-mounted.ts              # Utility: hook that returns true after the component mounts
    components/
      icons.ts                        # Icon definitions
      theme-switcher/
        index.tsx                     # Light/dark/system theme toggle component
        styles.css                    # Theme switcher styles
      mdx-components.tsx              # MDX component registry: static set + factory with auto-resolved Sandpack dir
      sandpack/
        index.tsx                     # Sandpack wrapper: glob-loads .example files, strips metadata, merges file sets
        _editor.tsx                   # Lazy-loaded Sandpack editor with resizable panels and theme awareness
        index.example.tsx             # Sandpack template: React entry point (hidden from file explorer)
        render-boundary.example.tsx   # Sandpack template: re-render visualizer utility
    routes/
      _index.tsx                      # Landing page (/) - HomeLayout with feature sections and MDX examples
      docs.tsx                        # Docs layout wrapper (/docs/*) - DocsLayout with sidebar navigation
      docs.$.tsx                      # Docs splat route (/docs/**) - serves both HTML pages and .md loader responses
      docs-md-root.tsx                # Resource route for /docs.md - markdown of the docs index page
      llms-txt.tsx                    # Resource route for /llms.txt - page index with links to .md files
      llms-full-txt.tsx               # Resource route for /llms-full.txt - all pages concatenated as plain text
      *.mdx                           # MDX snippet files imported by the landing page for feature examples
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

| Path | Handler File | Type | Purpose |
| --- | --- | --- | --- |
| `/` | `routes/_index.tsx` | Component | Landing page with feature demos using inline MDX snippets |
| `/docs` | `routes/docs.tsx` | Layout | Wraps all `/docs/*` child routes in `DocsLayout` with sidebar navigation |
| `/docs/**` | `routes/docs.$.tsx` | Component + Loader | Renders individual doc pages (component branch) or returns `.md` content (loader branch) |
| `/docs.md` | `routes/docs-md-root.tsx` | Resource | Returns the docs index page as markdown |
| `/llms.txt` | `routes/llms-txt.tsx` | Resource | Returns a page index linking to individual `.md` files |
| `/llms-full.txt` | `routes/llms-full-txt.tsx` | Resource | Returns all doc pages concatenated as plain text |

### Resource route pattern

Routes that export only a `loader` function (no default component export) are resource routes. React Router serves them as raw responses rather than rendering them into the HTML shell. The three resource routes (`docs-md-root.tsx`, `llms-txt.tsx`, `llms-full-txt.tsx`) all follow this pattern - they return `Response` objects with text or markdown content types.

### The docs splat route dual behavior

The `docs.$.tsx` route serves two purposes through a single splat parameter:

- **HTML branch** (default export): When the URL has no `.md` extension, the component renders the MDX page using fumadocs `DocsPage`, `DocsTitle`, `DocsDescription`, and `DocsBody` components. The loader returns an empty object `{}` in this case.
- **Markdown branch** (loader): When the URL ends in `.md`, the loader strips the extension, looks up the page via `source.getPage()`, and returns a `Response` with `Content-Type: text/markdown; charset=utf-8`.

However, there is a fundamental React Router limitation: because `docs.$.tsx` has a default component export, React Router always treats it as a component route during prerendering. Even when the loader returns a `Response`, React Router wraps it in the HTML shell instead of serving the raw response. This means the `.md` URLs cannot be prerendered through normal means. The `generateMdFilesPlugin` works around this limitation (see section 6).

### Route configuration file

All routes are explicitly wired in `docs/src/routes.ts` using the `@react-router/dev/routes` API. The key declarations are: `index("routes/_index.tsx")` for `/`, `layout("routes/docs.tsx", [...])` wrapping `route("docs/*", "routes/docs.$.tsx")` for the docs subtree, and three top-level `route()` calls for `docs.md`, `llms.txt`, and `llms-full.txt`.

## 6. LLM / Markdown Endpoints

### /llms.txt

- **Content-Type**: `text/plain; charset=utf-8`
- **Route**: `routes/llms-txt.tsx` (resource route)
- **Content**: A structured index page with the project title, description, and a list of all doc pages. Each entry links to the page's `.md` URL (e.g., `/docs/api/signal.md`) with an optional description. Ends with a link to `/llms-full.txt` for the complete content.
- **Data source**: `source.getPages()` provides the page list; titles and descriptions come from frontmatter.

### /llms-full.txt

- **Content-Type**: `text/plain; charset=utf-8`
- **Route**: `routes/llms-full-txt.tsx` (resource route)
- **Content**: Every doc page's full processed markdown, concatenated with double newlines. Each page section includes YAML frontmatter (title, description, url, lastModified) and the processed markdown body.
- **Data source**: `source.getPages()` mapped through `getLLMText()`.

### /docs.md

- **Content-Type**: `text/markdown; charset=utf-8`
- **Route**: `routes/docs-md-root.tsx` (resource route)
- **Content**: The docs index page (`source.getPage([])`) rendered as markdown via `getLLMText()`.

### /docs/**/*.md

- **Content-Type**: `text/markdown; charset=utf-8`
- **Served by**: `routes/docs.$.tsx` loader at runtime (detects `.md` extension in the splat parameter and returns a markdown `Response`). Also written as static files to `docs/dist/client/` during the build by `generateMdFilesPlugin` — this is a prerendering workaround because React Router cannot prerender `.md` variants of routes that also have a default component export. Static hosting therefore serves the pre-generated `.md` files without hitting any server.
- **Content**: Each individual doc page as markdown with frontmatter, identical to what the `docs.$.tsx` loader would return for `.md` requests.

### getLLMText helper

Located at `docs/src/tools/get-llm-text.ts`. Accepts a fumadocs page object and returns a markdown string. It calls `data.getText("processed")` to get the processed markdown content (this requires `includeProcessedMarkdown: true` in the fumadocs docs collection config). It prepends YAML frontmatter with title, description, url, and lastModified, followed by a level-1 heading and the processed body.

### generateMdFilesPlugin mechanism

**Why it exists**: React Router cannot prerender the `.md` variant of a route that also has a default component export. When `docs.$.tsx` exports both a loader and a component, React Router always renders the component into HTML during prerendering, ignoring the `Response` returned by the loader for `.md` URLs.

**What it does**: The plugin runs as a Vite `writeBundle` hook during the SSR build pass only. After the server bundle has been written to `docs/dist/server/index.js`, the plugin:

1. Dynamically imports the compiled server bundle.
2. Locates the `routes/docs.$` route module by its route ID.
3. Scans `docs/content/docs/` for all `.mdx` files using `getMdxRoutes()`.
4. For each page (excluding `/docs` itself, which is handled by the `docs-md-root` resource route), calls the route's loader directly with a synthetic `Request` and the appropriate splat parameter.
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

### MDXComponents (static export)

A plain object containing the default fumadocs UI MDX components (from `fumadocs-ui/mdx`) plus additional registered components:

- `Accordion` / `Accordions` - Collapsible sections
- `TypeTable` - Type documentation tables
- `Sandpack` - Interactive code editor

### createMDXComponents(filePath)

A factory function that returns the same component set as `MDXComponents` but with `Sandpack` pre-filled: it extracts the directory from `filePath` by slicing up to the last `/` (falling back to the full `filePath` if no `/` is found) and passes the result as the `dir` prop. This means MDX content files can write `<Sandpack />` with no props and have the dir automatically resolve to their own directory.

Called in `docs.$.tsx` as `createMDXComponents(\`docs/${page.path}\`)`, where `page.path` is the page's path relative to the content root (e.g., `docs/tutorials/composing-state`).

## 9. Sandpack Integration

The full data flow from disk to browser editor:

### Step 1: Glob all example files

In `docs/src/components/sandpack/index.tsx`, `import.meta.glob` eagerly loads two sets of files at build time:

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

The `virtual:local-packages` Vite virtual module (declared in `docs/src/virtual.d.ts`, generated by `localPackagesPlugin` in `docs/vite.config.ts`) provides pre-built `@owanturist/signal` and `@owanturist/signal-react` as Sandpack file objects. The plugin reads each package's `dist/` directory and `package.json`, then exports them as hidden files under `/node_modules/`. These are included in `localFiles` alongside the template files.

### Step 5: Merge file sets

The final Sandpack file set is assembled by merging in this order (later entries override earlier ones):

1. Template files (`/index.tsx` hidden entry point, `/render-boundary.tsx` utility)
2. Local package files (hidden `/node_modules/` entries)
3. Dir-loaded example files (from `getExampleFiles()`)
4. Explicit `files` prop (if provided by the MDX author)

### Step 6: Lazy-loaded editor

The `SandpackEditor` component (`docs/src/components/sandpack/_editor.tsx`) lazy-loads the actual Sandpack and `react-resizable-panels` libraries via `React.lazy()`. This avoids loading the editor bundle during SSR or on pages that do not use Sandpack. The editor is wrapped in `<Suspense>` with a placeholder div matching the editor height.

The editor layout uses `react-resizable-panels` with a horizontal split (file explorer 20% | main panel 80%) and a vertical split within the main panel (code editor 65% | preview 35%). The theme follows the site theme via `next-themes`'s `useTheme()` hook.

### Template files

Both live in `docs/src/components/sandpack/` and are always included in every Sandpack instance:

- **`index.example.tsx`** - React entry point that renders `<App />` from `./app` inside `<StrictMode>`. Hidden from the Sandpack file explorer so users focus on the example code.
- **`render-boundary.example.tsx`** - A `RenderBoundary` component that wraps children with a labeled border and flashes red briefly on each re-render via CSS animation. Used in examples to visualize which components re-render.

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
- `useComponentExportOnlyModules: "off"` - Docs modules often mix component and non-component exports (e.g., `loader` + default component in `docs.$.tsx`).
- `useExportsLast: "off"` - React Router patterns place exports throughout the file.

### docs/*.{ts,tsx} and docs/src/**

Two overlapping overrides apply to config files and all docs source:

- `noNodejsModules: "off"` - Config files (`vite.config.ts`, `react-router.config.ts`) and some source files (e.g., `get-llm-text.ts`) use Node.js built-in modules like `fs` and `path`.
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
