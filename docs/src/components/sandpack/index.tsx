import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import type { SandpackFile, SandpackFiles } from "@codesandbox/sandpack-react"
import type { CSSProperties } from "react"

import { isDefined } from "~/tools/is-defined"
import { isString } from "~/tools/is-string"
import { Tuple } from "~/tools/tuple"

import { SandpackEditor, type SandpackEditorProps } from "./_editor"

const RE_TS_NOCHECK = /^\/\/ @ts-nocheck\n\n?/
const RE_REGION_START = /^\/\/#region \w+\n/gm
const RE_REGION_END = /^\/\/#endregion \w+\n?/gm

/** Strip `// @ts-nocheck` directive and region markers so they don't appear in Sandpack. */
function stripExampleMeta(code: string): string {
  return code.replace(RE_TS_NOCHECK, "").replace(RE_REGION_START, "").replace(RE_REGION_END, "")
}

/** Monorepo root - one level up from the docs directory. */
const root = path.resolve(process.cwd(), "..")

/** Directory containing this file and the `.example.tsx` Sandpack templates. */
const sandpackDir = path.resolve(process.cwd(), "src", "components", "sandpack")

/**
 * Normalizes a package.json `exports` field for Sandpack's bundler.
 *
 * Sandpack does not support conditional exports
 * (e.g. `{ "import": "...", "require": "...", "types": "..." }`).
 * It only understands simple string values per subpath key
 * (e.g. `{ ".": "./dist/index.js", "./foo": "./dist/foo.js" }`).
 *
 * Node's `exports` field has two forms:
 *
 * 1. **Subpath map** - keys start with `"."`:
 *    `{ ".": { "import": "..." }, "./monitor-factory": { "import": "..." } }`
 * 2. **Shorthand condition map** - no `"."` key, conditions at top level:
 *    `{ "import": "...", "require": "..." }`
 *
 * This function normalizes both forms into simple subpath-to-path entries
 * by extracting the `"import"` condition (ESM) from each entry.
 */
function flattenExports(
  input: Record<string, string | Record<string, string>>,
): Record<string, string> {
  const output = Object.entries(input)
    .map(([key, value]) => {
      if (!isString(value)) {
        return Tuple(key, value.import ?? "")
      }

      if (key === "import") {
        return Tuple(".", value)
      }

      return null
    })
    .filter(isDefined)

  return Object.fromEntries(output)
}

/**
 * Reads a local monorepo package and produces virtual `node_modules` entries
 * for Sandpack's in-browser filesystem.
 *
 * Reads the real `package.json` and all ESM dist files (`.js` only - CJS and
 * type declarations are excluded since Sandpack's bundler doesn't need them).
 *
 * The `package.json` is patched before injection:
 * - `main` is overridden to point at the ESM entry (`module` field) because
 *   the real `main` targets the CJS build (`.cjs`), which is not included.
 * - `exports` is flattened via {@link flattenExports} to remove conditional
 *   export syntax that Sandpack cannot resolve.
 *
 * @param name - Full npm package name (e.g. `"@owanturist/signal"`).
 *   The directory name is derived by stripping the `@owanturist/` scope.
 */
function readPackage(name: string): Array<[string, SandpackFile]> {
  const pkgRoot = path.join(root, "packages", name.replace("@owanturist/", ""))

  const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, "package.json"), "utf-8"))

  const pkgFile = Tuple(`/node_modules/${name}/package.json`, {
    hidden: true,
    code: JSON.stringify({
      ...pkg,
      main: pkg.module,
      exports: flattenExports(pkg.exports ?? {}),
    }),
  })

  const distPath = path.join(pkgRoot, "dist")
  const distFiles = fs
    .readdirSync(distPath)
    .filter((fileName) => fileName.endsWith(".js"))
    .map((filename) => {
      const code = fs.readFileSync(path.join(distPath, filename), "utf-8")

      return Tuple(`/node_modules/${name}/dist/${filename}`, { hidden: true, code })
    })

  return [pkgFile, ...distFiles]
}

/**
 * Virtual `node_modules` files for all local packages, plus the Sandpack
 * bootstrap entry point and the RenderBoundary helper. Built once at module
 * init so that Sandpack resolves imports from these packages against local
 * dist builds instead of fetching published versions from npm.
 */
const localFiles: SandpackFiles = {
  "/index.tsx": {
    hidden: true,
    code: stripExampleMeta(fs.readFileSync(path.join(sandpackDir, "index.example.tsx"), "utf-8")),
  },
  "/render-boundary.tsx": {
    code: stripExampleMeta(
      fs.readFileSync(path.join(sandpackDir, "render-boundary.example.tsx"), "utf-8"),
    ),
  },
  ...Object.fromEntries([
    ...readPackage("@owanturist/signal"),
    ...readPackage("@owanturist/signal-react"),
  ]),
}

/**
 * Recursively reads `.example.ts` and `.example.tsx` files from a directory
 * and returns Sandpack-style file entries.
 *
 * The `.example` segment is stripped from filenames and paths are made relative
 * to the given directory with a leading `/`.
 * E.g. `align/state.example.ts` -> `"/align/state.ts"`.
 */
function readExampleDir(dirPath: string, prefix = ""): SandpackFiles {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  let files: SandpackFiles = {}

  for (const entry of entries) {
    if (entry.isDirectory()) {
      files = {
        ...files,
        ...readExampleDir(path.join(dirPath, entry.name), `${prefix}/${entry.name}`),
      }
    } else if (entry.name.includes(".example.")) {
      const sandpackName = `${prefix}/${entry.name.replace(".example", "")}`
      const code = stripExampleMeta(fs.readFileSync(path.join(dirPath, entry.name), "utf-8"))

      files[sandpackName] = { code }
    }
  }

  return files
}

interface Props extends Omit<SandpackEditorProps, "localFiles" | "files"> {
  height?: number
  /**
   * Path to a directory (relative to `docs/content/`) containing `.example.ts`
   * and `.example.tsx` files to load into Sandpack.
   */
  dir?: string
  files?: SandpackFiles
}

/**
 * Server component wrapper that injects local package dist files into
 * Sandpack's virtual filesystem. User-provided `files` take precedence
 * over the injected `localFiles` via spread order in `_editor.tsx`.
 */
export function Sandpack({ height = 600, dir, files: explicitFiles, ...props }: Props) {
  let files: SandpackFiles = {}

  if (dir) {
    const absDir = path.resolve(process.cwd(), "content", dir)
    files = readExampleDir(absDir)
  }

  // Explicit files override dir-loaded files
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
