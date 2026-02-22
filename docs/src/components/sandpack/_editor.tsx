"use client"

import type { SandpackFile, SandpackFiles } from "@codesandbox/sandpack-react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

const INDEX_FILE = {
  hidden: true,
  code: `
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import App from "./app";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
`,
} satisfies SandpackFile

/**
 * Visualizes component re-render boundaries in Sandpack examples.
 *
 * Each `<RenderBoundary>` renders a labeled box with a subtle gray background.
 * Nested boundaries compound their backgrounds, making the component tree
 * visible at a glance. When a component re-renders, its boundary briefly
 * flashes pink - demonstrating that only components reading a changed Signal
 * re-render, while parent components stay untouched.
 *
 * Usage in example code:
 * ```tsx
 * import { RenderBoundary } from "/render-boundary"
 *
 * export function MyComponent() {
 *   return <RenderBoundary name="MyComponent">...</RenderBoundary>
 * }
 * ```
 */
const RENDER_BOUNDARY_FILE = {
  code: `import { useEffect, useRef } from "react"

export function RenderBoundary({ name, style, children, ...rest }) {
  const ref = useRef(null)

  useEffect(() => {
    const animation = ref.current?.animate(
      { "--rb-color": ["pink", "gray"] },
      { duration: 600 },
    )

    return () => animation?.cancel()
  })

  return (
    <div
      ref={ref}
      style={{
        "--rb-color": "gray",
        "--rb-bg": "color-mix(in srgb, var(--rb-color) 10%, transparent)",
        "--rb-border": "color-mix(in srgb, var(--rb-color) 20%, transparent)",
        position: "relative",
        backgroundColor: "var(--rb-bg)",
        border: "1px solid var(--rb-border)",
        borderRadius: 4,
        padding: "16px 12px 12px",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          position: "absolute",
          top: -4,
          left: 8,
          fontSize: 10,
          lineHeight: "16px",
          padding: "0 4px",
          backgroundColor: "#ccc",
          borderRadius: 2,
          color: "#888",
          fontFamily: "monospace",
        }}
      >
        {name}
      </span>
      {children}
    </div>
  )
}
`,
} satisfies SandpackFile

export interface SandpackEditorProps {
  files: SandpackFiles
  entry?: string
  localFiles: SandpackFiles
}

export const SandpackEditor = dynamic(
  async () => {
    const {
      SandpackLayout,
      SandpackCodeEditor,
      SandpackFileExplorer,
      SandpackPreview,
      SandpackProvider,
    } = await import("@codesandbox/sandpack-react")

    return ({ files, entry, localFiles }: SandpackEditorProps) => {
      const { resolvedTheme = "dark" } = useTheme()

      return (
        <SandpackProvider
          template="react-ts"
          files={{
            "/index.tsx": INDEX_FILE,
            "/render-boundary.tsx": RENDER_BOUNDARY_FILE,
            ...localFiles,
            ...files,
          }}
          options={{
            activeFile: entry,
            classes: {
              "sp-layout": "rounded-xl!",
            },
          }}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          customSetup={{
            dependencies: {
              "use-sync-external-store": "^1.6.0",
            },
          }}
        >
          <SandpackLayout className="h-(--sp-height)">
            <SandpackFileExplorer style={{ height: "100%" }} autoHiddenFiles />
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <SandpackCodeEditor showLineNumbers style={{ flex: "0 0 65%" }} />
              <SandpackPreview style={{ flex: "0 0 35%" }} />
            </div>
          </SandpackLayout>
        </SandpackProvider>
      )
    }
  },
  {
    ssr: false,
    loading: () => <div className="h-(--sp-height) rounded-xl border bg-fd-background" />,
  },
)
