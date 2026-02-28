import { DocsLayout } from "fumadocs-ui/layouts/docs"
import { Outlet } from "react-router"

import { ThemeSwitcher } from "@/components/theme-switcher"
import { source } from "@/source"

export default function DocsLayoutRoute() {
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
