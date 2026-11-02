import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"
import { RootProvider } from "fumadocs-ui/provider/tanstack"
import type { FC } from "react"

import "@/app.css"
import { SITE_NAME, createPageHead } from "@/tools/page-head"

const initTheme = `
(() => {
  try {
    var storedTheme = localStorage.getItem("${import.meta.env.VITE_THEME_STORAGE_KEY}");
    if (
      storedTheme === "${import.meta.env.VITE_DARK_THEME_CLASS}" ||
      (!storedTheme && matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("${import.meta.env.VITE_DARK_THEME_CLASS}");
    }
  } catch (error) {}
})()
`
  .trim()
  .replace(/\s+/gu, " ")

const RootComponent: FC = () => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: This is safe because it only sets the initial theme */}
        <script dangerouslySetInnerHTML={{ __html: initTheme }} />
        <HeadContent />
      </head>
      <body>
        <RootProvider theme={{ enabled: false }}>
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  head: () => {
    const { meta } = createPageHead({ title: SITE_NAME })

    return {
      meta: [
        ...meta,
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    }
  },
  component: RootComponent,
})
