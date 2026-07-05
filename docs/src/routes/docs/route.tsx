import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"

import { ThemeSwitcher } from "@/components/theme-switcher"
import { source } from "@/source"

export const Route = createFileRoute("/docs")({
  component: DocsLayoutRoute,
  // Catches `notFound()` thrown by `/docs/` (index) and `/docs/$` (splat).
  // Renders in place of `<Outlet />`, so `DocsLayout` (sidebar/nav/theme)
  // still wraps the 404 for visual consistency.
  notFoundComponent: DocsNotFound,
})

function DocsLayoutRoute() {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{ title: "@owanturist/signal" }}
      themeSwitch={{
        mode: "light-dark-system",
        component: <ThemeSwitcher className="ms-auto p-0" />,
      }}
    >
      <Outlet />
    </DocsLayout>
  )
}

function DocsNotFound() {
  return (
    <DocsPage tableOfContent={{ style: "clerk" }} toc={[]}>
      <DocsTitle>Page not found</DocsTitle>
      <DocsDescription>
        The page you're looking for doesn't exist or has been moved.
      </DocsDescription>
      <DocsBody>
        <p>
          Return to the <Link to="/docs">docs home page</Link>.
        </p>
      </DocsBody>
    </DocsPage>
  )
}
