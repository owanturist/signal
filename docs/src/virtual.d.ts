declare module "virtual:local-packages" {
  import type { SandpackFiles } from "@codesandbox/sandpack-react"
  const files: SandpackFiles
  export default files
}
