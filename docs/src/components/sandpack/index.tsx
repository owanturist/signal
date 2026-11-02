import type { SandpackFiles } from "@codesandbox/sandpack-react"
import type { CSSProperties } from "react"

import { SandpackEditor, type SandpackEditorProps } from "./_editor"
import localPackageFiles from "virtual:local-packages"

const RE_TS_NOCHECK = /^\/\/ @ts-nocheck\n\n?/u
const RE_REGION_START = /^\/\/#region \w+\n/gmu
const RE_REGION_END = /^\/\/#endregion \w+\n?/gmu

function stripExampleMeta(code: string): string {
  return code.replace(RE_TS_NOCHECK, "").replace(RE_REGION_START, "").replace(RE_REGION_END, "")
}

const allContentExamples = import.meta.glob<string>("/content/**/*.example.{ts,tsx}", {
  eager: true,
  query: "?raw",
  import: "default",
})

const sandpackTemplates = import.meta.glob<string>("/src/components/sandpack/*.example.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
})

const sandpackStyles = import.meta.glob<string>("/src/components/sandpack/*.example.css", {
  eager: true,
  query: "?raw",
  import: "default",
})

const indexTemplate = sandpackTemplates["/src/components/sandpack/index.example.tsx"] ?? ""
const renderBoundaryTemplate =
  sandpackTemplates["/src/components/sandpack/render-boundary.example.tsx"] ?? ""

const localFiles: SandpackFiles = {
  "/index.tsx": {
    hidden: true,
    code: stripExampleMeta(indexTemplate),
  },
  "/styles.css": {
    hidden: true,
    code: sandpackStyles["/src/components/sandpack/styles.example.css"] ?? "",
  },
  "/render-boundary.tsx": {
    hidden: true,
    code: stripExampleMeta(renderBoundaryTemplate),
  },
  ...localPackageFiles,
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
        // biome-ignore lint/nursery/noUnsafeTypeAssertion: CSS custom properties are not part of CSSProperties
        { "--sp-height": `${height}px` } as CSSProperties
      }
    >
      <SandpackEditor localFiles={localFiles} files={files} {...props} />
    </div>
  )
}
