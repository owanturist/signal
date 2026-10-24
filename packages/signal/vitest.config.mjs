import tsconfigPaths from "vite-tsconfig-paths"
import { defineProject } from "vitest/config"

export default defineProject({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    isolate: true,
    execArgv: ["--expose-gc"],
    setupFiles: "./setup-tests.ts",
  },
})
