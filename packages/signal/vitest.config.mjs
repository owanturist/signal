import { defineProject } from "vitest/config"

export default defineProject({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    globals: true,
    isolate: true,
    execArgv: ["--expose-gc"],
    setupFiles: "./setup-tests.ts",
  },
})
