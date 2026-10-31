import { defineProject } from "vitest/config"

export default defineProject({
  test: {
    globals: true,
    isolate: true,
    execArgv: ["--expose-gc"],
    setupFiles: "./setup-tests.ts",
  },
})
