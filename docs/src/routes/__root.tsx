import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router"
import { RootProvider } from "fumadocs-ui/provider/tanstack"

import "@/app.css"

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

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
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
