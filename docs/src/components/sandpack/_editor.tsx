import type { SandpackFiles } from "@codesandbox/sandpack-react"
import { type FC, Suspense, lazy } from "react"

export interface SandpackEditorProps {
  files: SandpackFiles
  entry?: string
  /** Fixed height of the code editor in px; the preview takes the rest. */
  codeHeight?: number
  localFiles: SandpackFiles
}

// Sandpack and the resizable panels are heavy, so they load only in the browser, on demand
const LazyEditor = lazy(async () => {
  const { Editor } = await import("./_editor-impl")

  return { default: Editor }
})

export const SandpackEditor: FC<SandpackEditorProps> = (props) => (
  <Suspense fallback={<div className="h-(--sp-height) rounded-xl border bg-fd-background" />}>
    <LazyEditor {...props} />
  </Suspense>
)
