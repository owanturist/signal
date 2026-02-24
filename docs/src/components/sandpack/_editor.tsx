"use client"

import type { SandpackFiles } from "@codesandbox/sandpack-react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

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
