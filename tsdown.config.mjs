import { readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { minify } from "terser"
import { defineConfig } from "tsdown"

const JS_FILE = /\.[cm]?js$/u
// source-only workspace package, inlined into every bundle
const INTERNALS = /^@owanturist\/internals\//u

/**
 * Packages the built output may import: the runtime dependencies of the package being built.
 * Anything else, such as a devDependency, is a leak that consumers would not have installed.
 *
 * @param {string} cwd
 * @returns {Array<string>}
 */
function runtimeDependencies(cwd) {
  const { dependencies, peerDependencies } = JSON.parse(
    readFileSync(path.join(cwd, "package.json"), "utf8"),
  )

  return Object.keys({ ...dependencies, ...peerDependencies })
}

/** @type {import("terser").MinifyOptions} */
const terserOptions = {
  mangle: {
    module: false,
    keep_classnames: false,
    keep_fnames: false,
    properties: {
      regex: /^_[^_]\w+[^_]$/u,
      // undocumented, but it specifies how to mangle properties
      cache: {
        props: {
          $_value: "_",
          $_emitters: "$",
        },
      },
    },
  },
}

/**
 * Oxc's minifier does not support terser's property mangling, so terser runs per chunk.
 * The same `terserOptions` object is reused for every chunk: its mutable `mangle.properties.cache`
 * keeps a property mangled to the same name across all chunks of the build.
 *
 * @param {import("tsdown").Rolldown.ModuleFormat} format
 * @returns {import("tsdown").Rolldown.Plugin}
 */
function terserPlugin(format) {
  return {
    name: "terser",
    async renderChunk(code, { fileName }) {
      // declaration files are emitted as chunks of the same build
      if (!JS_FILE.test(fileName)) {
        return null
      }

      const { code: minified } = await minify(code, {
        ...(format === "es" ? { module: true } : { toplevel: true }),
        ...terserOptions,
      })

      return minified
    },
  }
}

export default defineConfig(({ minify: shouldMinify }) => ({
  // the config is shared by the packages, so build in the package directory pnpm runs the script from
  cwd: process.cwd(),
  target: "es2020",
  format: ["cjs", "esm"],
  // "type": "module" packages: .js/.d.ts for ESM and .cjs/.d.cts for CJS, as referenced by package.json exports
  fixedExtension: false,
  dts: {
    tsconfig: path.resolve(import.meta.dirname, "tsconfig.build.json"),
  },
  sourcemap: true,
  // any package is external
  deps: {
    neverBundle: true,
    alwaysBundle: [INTERNALS],
    onlyImport: runtimeDependencies(process.cwd()),
  },
  minify: false,
  outputOptions: (options, format) => ({
    ...options,
    // mark CJS output as transpiled ESM, as tsup did
    esModule: true,
    strict: true,
    plugins: shouldMinify ? [terserPlugin(format === "es" ? "es" : "cjs")] : [],
  }),
}))
