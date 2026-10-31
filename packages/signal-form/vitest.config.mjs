import { defaultClientConditions, defaultServerConditions } from "vite"
import { defineProject } from "vitest/config"

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
    globals: true,
    isolate: false,
    setupFiles: "./setup-tests.ts",
  },
})
