import { Accordion, Accordions } from "fumadocs-ui/components/accordion"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultComponents from "fumadocs-ui/mdx"

import { Sandpack, type SandpackProps } from "./sandpack"

/** Static MDX components for pages that don't need Sandpack's dir resolution. */
export const MDXComponents = {
  ...defaultComponents,
  // biome-ignore-start lint/style/useNamingConvention: components must be PascalCase
  Accordion,
  Accordions,

  TypeTable,
  Sandpack,
  // biome-ignore-end lint/style/useNamingConvention: components must be PascalCase
}

/** MDX components with Sandpack's dir defaulting to the MDX file's directory. */
export function createMDXComponents(filePath: string) {
  const lastSlash = filePath.lastIndexOf("/")
  const fileDir = lastSlash >= 0 ? filePath.slice(0, lastSlash) : filePath

  return {
    ...MDXComponents,
    // biome-ignore lint/style/useNamingConvention: component must be PascalCase
    Sandpack: (props: SandpackProps) => <Sandpack dir={fileDir} {...props} />,
  }
}
