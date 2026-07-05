import { useCallback, useEffect, useLayoutEffect, useState } from "react"

const DARK_CLASS = import.meta.env.VITE_DARK_THEME_CLASS
const STORAGE_KEY = import.meta.env.VITE_THEME_STORAGE_KEY

type Theme = "system" | "dark" | "light"

function systemDarkMedia() {
  return typeof globalThis.matchMedia === "undefined"
    ? undefined
    : globalThis.matchMedia("(prefers-color-scheme: dark)")
}

function useTheme(): {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: Exclude<Theme, "system">
} {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = typeof localStorage === "undefined" ? null : localStorage.getItem(STORAGE_KEY)

    if (stored === "dark" || stored === "light") {
      return stored
    }

    return "system"
  })

  const [systemTheme, setSystemTheme] = useState<Exclude<Theme, "system">>(() => {
    const isDark = systemDarkMedia()?.matches ?? false

    return isDark ? "dark" : "light"
  })

  const resolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    const media = systemDarkMedia()

    const handler = ({ matches }: MediaQueryListEvent) => {
      setSystemTheme(matches ? "dark" : "light")
    }

    media?.addEventListener("change", handler)
    return () => {
      media?.removeEventListener("change", handler)
    }
  }, [])

  useLayoutEffect(() => {
    if (resolvedTheme === "dark") {
      document.documentElement.classList.add(DARK_CLASS)
    } else {
      document.documentElement.classList.remove(DARK_CLASS)
    }
  }, [resolvedTheme])

  return {
    theme,
    resolvedTheme,
    setTheme: useCallback((next) => {
      setTheme(next)

      if (next === "system") {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, next)
      }
    }, []),
  }
}

export type { Theme }
export { useTheme }
