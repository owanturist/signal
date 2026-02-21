"use client"

import {
  SandpackCodeEditor,
  SandpackFileExplorer,
  type SandpackFiles,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react"
import { useTheme } from "next-themes"

export interface Props {
  files: SandpackFiles
  entry?: string
  height?: number
  signalVersion: string
  signalReactVersion: string
}

export function SandpackImpl({
  files,
  entry,
  height = 600,
  signalVersion,
  signalReactVersion,
}: Props) {
  const { resolvedTheme = "dark" } = useTheme()

  return (
    <SandpackProvider
      template="react-ts"
      files={files}
      options={{ activeFile: entry }}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      customSetup={{
        dependencies: {
          "@owanturist/signal": signalVersion,
          "@owanturist/signal-react": signalReactVersion,
        },
      }}
    >
      <SandpackLayout style={{ height }}>
        <SandpackFileExplorer style={{ height: "100%" }} />
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
