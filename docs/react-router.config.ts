import { readdirSync } from "node:fs"
import path from "node:path"
import type { Config } from "@react-router/dev/config"

const MDX_EXT_RE = /\.mdx$/

function getMdxRoutes(dir: string, baseUrl: string): Array<string> {
  const routes: Array<string> = []

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...getMdxRoutes(path.join(dir, entry.name), `${baseUrl}/${entry.name}`))
    } else if (entry.name.endsWith(".mdx")) {
      const slug = entry.name.replace(MDX_EXT_RE, "")
      routes.push(slug === "index" ? baseUrl : `${baseUrl}/${slug}`)
    }
  }

  return routes
}

export default {
  ssr: false,
  buildDirectory: "dist",
  prerender() {
    const contentDir = path.resolve(import.meta.dirname, "content/docs")
    const mdxRoutes = getMdxRoutes(contentDir, "/docs")
    return ["/", "/llms.txt", "/llms-full.txt", ...mdxRoutes, "/docs.md"]
  },
  appDirectory: "src",
} satisfies Config
