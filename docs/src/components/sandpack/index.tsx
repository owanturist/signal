import type { SandpackFiles } from "@codesandbox/sandpack-react"
import type { CSSProperties } from "react"

import { SandpackEditor, type SandpackEditorProps } from "./_editor"
import localPackageFiles from "virtual:local-packages"

const RE_TS_NOCHECK = /^\/\/ @ts-nocheck\n\n?/
const RE_REGION_START = /^\/\/#region \w+\n/gm
const RE_REGION_END = /^\/\/#endregion \w+\n?/gm

function stripExampleMeta(code: string): string {
  return code.replace(RE_TS_NOCHECK, "").replace(RE_REGION_START, "").replace(RE_REGION_END, "")
}

const allContentExamples = import.meta.glob("/content/**/*.example.{ts,tsx}", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>

const sandpackTemplates = import.meta.glob("/src/components/sandpack/*.example.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>

const indexTemplate = sandpackTemplates["/src/components/sandpack/index.example.tsx"] ?? ""
const renderBoundaryTemplate =
  sandpackTemplates["/src/components/sandpack/render-boundary.example.tsx"] ?? ""

const localFiles: SandpackFiles = {
  "/index.tsx": {
    hidden: true,
    code: stripExampleMeta(indexTemplate),
  },
  "/render-boundary.tsx": {
    code: stripExampleMeta(renderBoundaryTemplate),
  },
  ...(localPackageFiles as SandpackFiles),
}

function getExampleFiles(dir: string): SandpackFiles {
  const prefix = `/content/${dir}/`
  const files: SandpackFiles = {}

  for (const [globPath, code] of Object.entries(allContentExamples)) {
    if (globPath.startsWith(prefix)) {
      const relativePath = globPath.slice(prefix.length)
      const sandpackPath = `/${relativePath.replace(".example", "")}`
      files[sandpackPath] = { code: stripExampleMeta(code) }
    }
  }

  return files
}

export interface SandpackProps extends Omit<SandpackEditorProps, "localFiles" | "files"> {
  height?: number
  /**
   * Path to a directory (relative to `docs/content/`) containing `.example.ts`
   * and `.example.tsx` files to load into Sandpack.
   */
  dir?: string
  files?: SandpackFiles
}

export function Sandpack({ height = 600, dir, files: explicitFiles, ...props }: SandpackProps) {
  let files: SandpackFiles = {}

  if (dir) {
    files = getExampleFiles(dir)
  }

  files = { ...files, ...explicitFiles }

  return (
    <div
      className="contents"
      style={
        {
          "--sp-height": `${height}px`,
        } as CSSProperties
      }
    >
      <SandpackEditor localFiles={localFiles} files={files} {...props} />
    </div>
  )
}
