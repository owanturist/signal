import type { RouteConfig } from "@react-router/dev/routes"
import { index, layout, route } from "@react-router/dev/routes"

export default [
  route("docs.md", "routes/docs-md-root.tsx"),
  route("llms.txt", "routes/llms-txt.tsx"),
  route("llms-full.txt", "routes/llms-full-txt.tsx"),
  index("routes/_index.tsx"),
  layout("routes/docs.tsx", [route("docs/*", "routes/docs.$.tsx")]),
] satisfies RouteConfig
