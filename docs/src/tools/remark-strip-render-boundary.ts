interface MdastNode {
  type: string
  value?: string
  children?: Array<MdastNode>
}

const IMPORT_LINE = /^import \{ RenderBoundary \} from "\/render-boundary"\n/mu

const NAME = String.raw`name=(?:"[^"]*"|\{[^}]*\})`
const NAME_ONLY = new RegExp(String.raw`<RenderBoundary\s+${NAME}\s*>`, "gu")
const NAME_THEN_PROPS = new RegExp(String.raw`<RenderBoundary(\s+)${NAME}\s+`, "gu")

function strip(node: MdastNode): void {
  if (node.type === "code" && node.value?.includes("RenderBoundary")) {
    node.value = node.value
      .replace(IMPORT_LINE, "")
      .replace(NAME_ONLY, "<div>")
      .replace(NAME_THEN_PROPS, "<div$1")
      .replace(/<\/RenderBoundary>/gu, "</div>")
  }

  node.children?.forEach(strip)
}

/**
 * `RenderBoundary` flashes on re-render and exists only for the live Sandpack examples.
 * Code blocks in prose show the same example files with it swapped for a plain `<div>`.
 */
export function remarkStripRenderBoundary() {
  return strip
}
