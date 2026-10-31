import { version } from "react"
import { defaultClientConditions, defaultServerConditions } from "vite"
import { defineProject } from "vitest/config"

console.log(`Running @owanturist/signal-signal tests against react@${version}`)

export default defineProject({
  resolve: {
    // resolve workspace packages to their sources, see package.json#exports
    conditions: ["@owanturist/source", ...defaultClientConditions],
  },

  ssr: {
    resolve: {
      conditions: ["@owanturist/source", ...defaultServerConditions],
    },
  },

  test: {
    // reuses happy-dom per worker; vmThreads rejects --expose-gc in execArgv
    pool: "vmForks",
    globals: true,
    isolate: true,
    execArgv: ["--expose-gc"],
    environment: "happy-dom",
    setupFiles: "./setup-tests.ts",
  },
})
