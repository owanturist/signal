import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import type { SandpackFile } from "@codesandbox/sandpack-react"
import type { CSSProperties } from "react"

import { isDefined } from "~/tools/is-defined"
import { isString } from "~/tools/is-string"
import { Tuple } from "~/tools/tuple"

import { SandpackEditor, type SandpackEditorProps } from "./_editor"

/** Monorepo root - one level up from the docs directory. */
const root = path.resolve(process.cwd(), "..")

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
 * Virtual `node_modules` files for all local packages. Built once at module
 * init so that Sandpack resolves imports from these packages against local
 * dist builds instead of fetching published versions from npm.
 */
const localFiles = Object.fromEntries([
  ...readPackage("@owanturist/signal"),
  ...readPackage("@owanturist/signal-react"),
])

interface Props extends Omit<SandpackEditorProps, "localFiles"> {
  height?: number
}

/**
 * Server component wrapper that injects local package dist files into
 * Sandpack's virtual filesystem. User-provided `files` take precedence
 * over the injected `localFiles` via spread order in `_editor.tsx`.
 */
export function Sandpack({ height = 600, ...props }: Props) {
  return (
    <div
      className="contents"
      style={
        {
          "--sp-height": `${height}px`,
        } as CSSProperties
      }
    >
      <SandpackEditor localFiles={localFiles} {...props} />
    </div>
  )
}
