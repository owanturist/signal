import fs from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import url from "node:url"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import mdx from "fumadocs-mdx/vite"
import { type Plugin, defineConfig } from "vite"

import sourceConfigDefault, { docs } from "./source.config"

const root = path.resolve(import.meta.dirname, "..")

const MDX_EXT_RE = /\.mdx$/
const DOCS_PREFIX_RE = /^\/docs\//
const DOUBLE_SLASH_RE = /\/\/+/g

const HTTP_OK = 200
const LOG_PREVIEW_LENGTH = 200

interface RouteModule {
  loader?: (args: { params: Record<string, string>; request: Request }) => Promise<unknown>
  default?: unknown
}

interface ServerBuild {
  routes: Record<string, { module: RouteModule }>
  prerender: Array<string>
  [key: string]: unknown
}

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
        return
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

async function generateMdRoute(
  mdRoute: string,
  docsSplatRoute: { module: RouteModule },
  clientBuildDirectory: string,
): Promise<void> {
  // mdRoute looks like /docs/api/batch.md → splat param is "api/batch.md"
  const splat = mdRoute.replace(DOCS_PREFIX_RE, "")
  try {
    const result = await docsSplatRoute.module.loader?.({
      params: { "*": splat },
      request: new Request(`http://localhost${mdRoute}`),
    })
    if (!(result instanceof Response)) {
      console.warn(
        `[generate-md-files] Loader for ${mdRoute} did not return a Response, got:`,
        typeof result,
      )
      return
    }
    if (result.status !== HTTP_OK) {
      const body = await result.text()
      console.warn(
        `[generate-md-files] ${mdRoute} status ${result.status}: ${body.slice(0, LOG_PREVIEW_LENGTH)}`,
      )
      return
    }
    const content = Buffer.from(await result.arrayBuffer())
    const normalizedPath = mdRoute.replace(DOUBLE_SLASH_RE, "/")
    const outfile = path.join(clientBuildDirectory, ...normalizedPath.split("/"))
    await mkdir(path.dirname(outfile), { recursive: true })
    await writeFile(outfile, content)
    console.info(`[generate-md-files] Generated: ${mdRoute} -> dist/client${mdRoute}`)
  } catch (err) {
    console.warn(`[generate-md-files] Failed to generate ${mdRoute}:`, err)
    if (err instanceof Error) {
      console.warn(err.stack)
    }
  }
}

function generateMdFilesPlugin(): Plugin {
  let isSsrBuild = false

  return {
    name: "generate-md-files",
    enforce: "pre",
    apply: "build",
    configResolved(config) {
      isSsrBuild = config.build.ssr !== false && Boolean(config.build.ssr)
    },
    async writeBundle() {
      if (!isSsrBuild) {
        return
      }

      const appDir = path.resolve(import.meta.dirname)
      const clientBuildDirectory = path.join(appDir, "dist", "client")
      const serverBuildDirectory = path.join(appDir, "dist", "server")

      const serverBuildPath = path.join(serverBuildDirectory, "index.js")
      if (!fs.existsSync(serverBuildPath)) {
        return
      }

      const serverModule = (await import(
        url.pathToFileURL(serverBuildPath).toString()
      )) as ServerBuild

      // Find the docs.$ route module (handles docs/* splat) by its route ID.
      // The route ID is derived from the file path: routes/docs.$ (no extension).
      // We call its loader directly to bypass the React Router HTTP handler,
      // which always renders HTML for routes with a default export even when
      // the loader returns a Response.
      const docsSplatRoute = serverModule.routes["routes/docs.$"]
      if (!docsSplatRoute?.module.loader) {
        console.warn("[generate-md-files] Could not find routes/docs.$ loader, skipping")
        return
      }

      const contentDir = path.join(appDir, "content", "docs")
      const mdxRoutes = getMdxRoutes(contentDir, "/docs")
      // Exclude /docs itself (handled by docs-md-root resource route) and generate
      // .md variants for all nested doc pages
      const mdRoutes = mdxRoutes.filter((r) => r !== "/docs").map((r) => `${r}.md`)

      await Promise.all(
        mdRoutes.map((mdRoute) => generateMdRoute(mdRoute, docsSplatRoute, clientBuildDirectory)),
      )
    },
  }
}

export default defineConfig(async () => ({
  plugins: [
    await mdx({ docs, default: sourceConfigDefault }),
    tailwindcss(),
    reactRouter(),
    localPackagesPlugin(),
    generateMdFilesPlugin(),
  ],
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "~/tools": path.resolve(import.meta.dirname, "../packages/tools/src"),
    },
  },
}))
