import type { SandpackFiles } from "@codesandbox/sandpack-react"
import { Suspense, lazy } from "react"

import { useTheme } from "@/components/theme-switcher/use-theme"

export interface SandpackEditorProps {
  files: SandpackFiles
  entry?: string
  localFiles: SandpackFiles
}

const LazyEditor = lazy(async () => {
  const [
    { SandpackLayout, SandpackCodeEditor, SandpackFileExplorer, SandpackPreview, SandpackProvider },
    { Group, Panel, Separator },
  ] = await Promise.all([import("@codesandbox/sandpack-react"), import("react-resizable-panels")])

  function Editor({ files, entry, localFiles }: SandpackEditorProps) {
    const { resolvedTheme } = useTheme()

    return (
      <SandpackProvider
        template="react-ts"
        files={{
          ...localFiles,
          ...files,
        }}
        options={{
          activeFile: entry,
          classes: {
            "sp-layout": "rounded-xl!",
          },
        }}
        theme={resolvedTheme}
        customSetup={{
          dependencies: {
            "use-sync-external-store": "^1.6.0",
          },
        }}
      >
        <SandpackLayout className="h-(--sp-height)">
          <Group orientation="horizontal" style={{ height: "100%" }}>
            <Panel defaultSize="20%" minSize="10%" maxSize="40%">
              <SandpackFileExplorer style={{ height: "100%" }} autoHiddenFiles />
            </Panel>
            <Separator className="w-0.5 shrink-0 grow-0 basis-px bg-fd-border transition-[background] duration-150 data-[separator=active]:bg-fd-primary data-[separator=hover]:bg-fd-primary" />
            <Panel defaultSize="80%">
              <Group orientation="vertical" style={{ height: "100%" }}>
                <Panel defaultSize="65%" minSize="25%">
                  <SandpackCodeEditor showLineNumbers style={{ height: "100%" }} />
                </Panel>
                <Separator className="h-0.5 shrink-0 grow-0 basis-px bg-fd-border transition-[background] duration-150 data-[separator=active]:bg-fd-primary data-[separator=hover]:bg-fd-primary" />
                <Panel defaultSize="35%" minSize="15%">
                  <SandpackPreview style={{ height: "100%" }} />
                </Panel>
              </Group>
            </Panel>
          </Group>
        </SandpackLayout>
      </SandpackProvider>
    )
  }

  return { default: Editor }
})

export function SandpackEditor(props: SandpackEditorProps) {
  return (
    <Suspense fallback={<div className="h-(--sp-height) rounded-xl border bg-fd-background" />}>
      <LazyEditor {...props} />
    </Suspense>
  )
}
