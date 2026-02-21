import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import type { SandpackFiles } from "@codesandbox/sandpack-react"

import { SandpackEditor } from "./editor"

interface Props {
  files: SandpackFiles
  entry?: string
  height?: number
}

export function Sandpack({ files, entry, height = 600 }: Props) {
  const root = path.resolve(process.cwd(), "..")

  const signalPkg: { version: string } = JSON.parse(
    fs.readFileSync(path.join(root, "packages/signal/package.json"), "utf-8"),
  )
  const signalReactPkg: { version: string } = JSON.parse(
    fs.readFileSync(path.join(root, "packages/signal-react/package.json"), "utf-8"),
  )

  return (
    <SandpackEditor
      files={files}
      entry={entry}
      height={height}
      signalVersion={signalPkg.version}
      signalReactVersion={signalReactPkg.version}
    />
  )
}
