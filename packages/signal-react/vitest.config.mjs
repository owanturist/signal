import { version } from "react"
import { defineProject } from "vitest/config"

console.log(`Running @owanturist/signal-signal tests against react@${version}`)

export default defineProject({
  resolve: {
    tsconfigPaths: true,
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
