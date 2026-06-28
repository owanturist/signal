import { RootProvider as FumadocsRouterProvider } from "fumadocs-ui/provider/react-router"
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router"

import "@/styles.css"

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
  .replace(/\s+/g, " ")

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/** biome-ignore lint/security/noDangerouslySetInnerHtml: This is safe because it only sets the initial theme */}
        <script dangerouslySetInnerHTML={{ __html: initTheme }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <FumadocsRouterProvider search={{ options: { type: "static" } }} theme={{ enabled: false }}>
      <Outlet />
    </FumadocsRouterProvider>
  )
}
