import fs from "node:fs"
import path from "node:path"
import type { SandpackFiles } from "@codesandbox/sandpack-react"
import { SandpackEditor } from "./sandpack-editor"

interface SandpackBundleProps {
  files: SandpackFiles
  entry?: string
}

export function SandpackBundle({ files, entry }: SandpackBundleProps) {
  const root = path.resolve(process.cwd(), "..")

  const signalPkg: { version: string } = JSON.parse(
    fs.readFileSync(
      path.join(root, "packages/signal/package.json"),
      "utf-8",
    ),
  )
  const signalReactPkg: { version: string } = JSON.parse(
    fs.readFileSync(
      path.join(root, "packages/signal-react/package.json"),
      "utf-8",
    ),
  )

  return (
    <SandpackEditor
      files={files}
      entry={entry}
      signalVersion={signalPkg.version}
      signalReactVersion={signalReactPkg.version}
    />
  )
}
