import { Popup, PopupContent, PopupTrigger } from "fumadocs-twoslash/ui"
import { Accordion, Accordions } from "fumadocs-ui/components/accordion"
import { TypeTable } from "fumadocs-ui/components/type-table"
import defaultComponents from "fumadocs-ui/mdx"
import { SandpackBundle } from "./sandpack-bundle"

export const MDXComponents = {
  ...defaultComponents,
  // biome-ignore-start lint/style/useNamingConvention: components must be PascalCase
  Accordion,
  Accordions,

  Popup,
  PopupContent,
  PopupTrigger,
  TypeTable,
  SandpackBundle,
  // biome-ignore-end lint/style/useNamingConvention: components must be PascalCase
}
