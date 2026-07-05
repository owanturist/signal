import fs from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { type Plugin, defineConfig } from "vite"

import sourceConfigDefault, { docs } from "./source.config"

const root = path.resolve(import.meta.dirname, "..")
const appDir = path.resolve(import.meta.dirname)

const MDX_EXT_RE = /\.mdx$/u
const NODE_BUILTIN_RE = /^node:(?:path|fs\/promises)$/u
const ANY_RE = /./u

function flattenExports(
  input: Record<string, string | Record<string, string>>,
): Record<string, string> {
  const output: Array<[string, string]> = []
  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string") {
      output.push([key, (value as Record<string, string>).import ?? ""])
    } else if (key === "import") {
      output.push([".", value])
    } else {
      output.push([key, value])
    }
  }
  return Object.fromEntries(output)
}

// fumadocs-core and fumadocs-mdx import node:path for path.join (pure string
// ops). These modules end up in the client bundle because route components call
// source.getPage() directly - fumadocs assumes Next.js server components where
// this code never reaches the browser. This plugin provides a minimal shim:
// - Production build (Rollup): resolveId with enforce:"pre" runs before
//   vite:resolve can externalize node:path to an empty __vite-browser-external
// - Dev server (esbuild pre-bundling): esbuild plugin injected via config hook
function nodePathPolyfillPlugin(): Plugin {
  const pathShimId = "\0node-path-shim"
  const pathShimCode = [
    "export function join(...s) {",
    '  return s.join("/").replace(/\\/+/g, "/")',
    "}",
    "export default { join }",
  ].join("\n")
  const fsShimId = "\0node-fs-shim"
  const fsShimCode = "export default {}"

  return {
    name: "node-path-polyfill",
    enforce: "pre",
    config() {
      return {
        optimizeDeps: {
          esbuildOptions: {
            plugins: [
              {
                name: "node-path-polyfill",
                setup(build) {
                  build.onResolve({ filter: NODE_BUILTIN_RE }, (args) => ({
                    path: args.path,
                    namespace: "node-shim",
                  }))
                  build.onLoad({ filter: ANY_RE, namespace: "node-shim" }, (args) => ({
                    contents: args.path === "node:path" ? pathShimCode : fsShimCode,
                    loader: "js",
                  }))
                },
              },
            ],
          },
        },
      }
    },
    resolveId(id, _importer, options) {
      if (options?.ssr) {
        return undefined
      }
      if (id === "node:path") {
        return pathShimId
      }
      if (id === "node:fs/promises") {
        return fsShimId
      }
      return undefined
    },
    load(id) {
      if (id === pathShimId) {
        return pathShimCode
      }
      if (id === fsShimId) {
        return fsShimCode
      }
      return undefined
    },
  }
}

// Exposes a virtual module containing the built `@owanturist/signal` and
// `@owanturist/signal-react` packages so Sandpack can preview them without
// fetching from npm. Requires `pnpm build` to have run for both packages.
function localPackagesPlugin(): Plugin {
  const virtualId = "virtual:local-packages"
  const resolvedId = `\0${virtualId}`

  return {
    name: "local-packages",
    resolveId(id) {
      if (id === virtualId) {
        return resolvedId
      }
      return undefined
    },
    load(id) {
      if (id !== resolvedId) {
        return undefined
      }

      const packages = ["signal", "signal-react"]
      const files: Record<string, { code: string; hidden?: boolean }> = {}

      for (const pkgShortName of packages) {
        const pkgRoot = path.join(root, "packages", pkgShortName)
        const pkg = JSON.parse(
          fs.readFileSync(path.join(pkgRoot, "package.json"), "utf-8"),
        ) as Record<string, unknown>
        const pkgName = pkg.name as string

        const flatExports = flattenExports(
          (pkg.exports ?? {}) as Record<string, string | Record<string, string>>,
        )

        files[`/node_modules/${pkgName}/package.json`] = {
          hidden: true,
          code: JSON.stringify({ ...pkg, main: pkg.module, exports: flatExports }),
        }

        const distPath = path.join(pkgRoot, "dist")
        for (const filename of fs.readdirSync(distPath).filter((f) => f.endsWith(".js"))) {
          files[`/node_modules/${pkgName}/dist/${filename}`] = {
            hidden: true,
            code: fs.readFileSync(path.join(distPath, filename), "utf-8"),
          }
        }
      }

      return `export default ${JSON.stringify(files)}`
    },
  }
}

function getMdxRoutes(dir: string, baseUrl: string): Array<string> {
  const routes: Array<string> = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...getMdxRoutes(path.join(dir, entry.name), `${baseUrl}/${entry.name}`))
    } else if (entry.name.endsWith(".mdx")) {
      const slug = entry.name.replace(MDX_EXT_RE, "")
      routes.push(slug === "index" ? baseUrl : `${baseUrl}/${slug}`)
    }
  }
  return routes
}

interface SourcePage {
  url: string
  path: string
  data: {
    title: string
    description?: string
    lastModified?: Date
    getText: (kind: "processed" | "raw") => Promise<string>
  }
}

interface SourceLike {
  getPages: () => Array<SourcePage>
  getPage: (slug: Array<string>) => SourcePage | undefined
}

// Writes static `.md` and `.txt` files into `dist/client/` after the SSR build
// completes. TanStack Start in this version has no `createServerFileRoute` API
// and its prerender always renders routes as HTML, so we cannot produce these
// files via routes.
//
// Implementation: after the SSR pass finishes, run a separate `vite.build()`
// against `src/_static-export.ts` to produce a self-contained ESM bundle of
// `{ source, getLLMText }`, then dynamically import it. A separate build is
// required (rather than `createServer` + `ssrLoadModule`) because Vite's dev
// server forces `environment.mode === "dev"`, which makes `fumadocs-mdx`
// compile MDX with the `jsxDEV` runtime that the production React used by the
// SSR build doesn't expose. A real build sets `environment.mode === "build"`.
//
// Outputs:
// - `/docs/<slug>.md` for every non-root docs page
// - `/docs.md` for the docs index
// - `/llms.txt` with a flat link list
// - `/llms-full.txt` with concatenated LLM text for every page
function staticFilesPlugin(): Plugin {
  return {
    name: "static-files",
    enforce: "post",
    apply: "build",
    async writeBundle(options) {
      // Only run after the SSR/server bundle - skip the client bundle pass.
      if (!options.dir?.endsWith(`${path.sep}server`)) {
        return
      }

      const clientDir = path.join(appDir, "dist", "client")
      const exportDir = path.join(appDir, ".tanstack", "static-export")

      const { build } = await import("vite")
      await build({
        configFile: false,
        root: appDir,
        logLevel: "warn",
        build: {
          ssr: true,
          minify: false,
          target: "esnext",
          outDir: exportDir,
          emptyOutDir: true,
          rollupOptions: {
            input: path.resolve(appDir, "src/_static-export.ts"),
            output: {
              format: "esm",
              entryFileNames: "_static-export.mjs",
              chunkFileNames: "[name]-[hash].mjs",
            },
          },
        },
        plugins: [await mdx({ docs, default: sourceConfigDefault })],
        resolve: {
          alias: {
            "@": path.resolve(appDir, "./src"),
          },
        },
      })

      const builtPath = path.join(exportDir, "_static-export.mjs")
      const mod = (await import(pathToFileURL(builtPath).href)) as {
        source: SourceLike
        getLLMText: (page: SourcePage) => Promise<string>
      }
      const { source, getLLMText } = mod
      const pages = source.getPages()

      // Per-page .md files (skip the docs root - that's written as /docs.md)
      await Promise.all(
        pages
          .filter((page) => page.url !== "/docs")
          .map(async (page) => {
            const text = await getLLMText(page)
            const outPath = path.join(clientDir, `${page.url}.md`)
            await mkdir(path.dirname(outPath), { recursive: true })
            await writeFile(outPath, text)
          }),
      )

      // /docs.md (root docs index)
      const rootPage = source.getPage([])
      if (rootPage) {
        await writeFile(path.join(clientDir, "docs.md"), await getLLMText(rootPage))
      }

      // /llms.txt
      const llmsTxt = [
        "# @owanturist/signal Documentation",
        "",
        "> Signal-based reactive state management for React",
        "",
        "## Docs",
        "",
        ...pages.map(({ data, url }) => {
          const description = data.description ? `: ${data.description}` : ""
          return `- [${data.title}](${url}.md)${description}`
        }),
        "",
        "## Full documentation",
        "",
        "- [llms-full.txt](/llms-full.txt)",
      ].join("\n")
      await writeFile(path.join(clientDir, "llms.txt"), llmsTxt)

      // /llms-full.txt
      const llmsFull = (await Promise.all(pages.map((p) => getLLMText(p)))).join("\n\n")
      await writeFile(path.join(clientDir, "llms-full.txt"), llmsFull)

      console.info(
        `[static-files] Wrote ${pages.length} .md files + /docs.md + /llms.txt + /llms-full.txt`,
      )
    },
  }
}

export default defineConfig(async () => {
  const contentDir = path.resolve(appDir, "content/docs")
  const mdxRoutes = getMdxRoutes(contentDir, "/docs")
  const prerenderPaths = ["/", ...mdxRoutes]

  return {
    plugins: [
      nodePathPolyfillPlugin(),
      await mdx({ docs, default: sourceConfigDefault }),
      tailwindcss(),
      localPackagesPlugin(),
      tanstackStart({
        router: {
          // Use kebab-case for the generated route tree to match the rest of
          // the codebase file-naming convention. Resolved relative to
          // `srcDirectory` (default `src`).
          generatedRouteTree: "route-tree.gen.ts",
        },
        // Explicitly list pages to prerender. The TanStack auto-discovery
        // skips dynamic routes (paths containing `$`), so we must enumerate
        // every `/docs/<slug>` path here. `crawlLinks: false` keeps the set
        // strictly closed.
        pages: prerenderPaths.map((p) => ({ path: p })),
        prerender: {
          enabled: true,
          crawlLinks: false,
        },
      }),
      // TanStack Start requires a React Refresh runtime in dev mode.
      // `@vitejs/plugin-react` provides `/@react-refresh`; the Start plugin
      // resolves that ID and throws a 500 on the virtual client entry when
      // it's missing. Must be registered AFTER `tanstackStart()`.
      react(),
      staticFilesPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(appDir, "./src"),
      },
    },
  }
})
