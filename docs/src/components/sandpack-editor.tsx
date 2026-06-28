"use client"
import {
  SandpackProvider,
  SandpackLayout,
  SandpackFileExplorer,
  SandpackCodeEditor,
  SandpackPreview,
  type SandpackFiles,
} from "@codesandbox/sandpack-react"

interface SandpackEditorProps {
  files: SandpackFiles
  entry?: string
  signalVersion: string
  signalReactVersion: string
}

export function SandpackEditor({
  files,
  entry,
  signalVersion,
  signalReactVersion,
}: SandpackEditorProps) {
  return (
    <SandpackProvider
      template="react-ts"
      files={files}
      options={{ activeFile: entry }}
      theme="dark"
      customSetup={{
        dependencies: {
          "@owanturist/signal": signalVersion,
          "@owanturist/signal-react": signalReactVersion,
        },
      }}
    >
      <SandpackLayout style={{ height: 600 }}>
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
