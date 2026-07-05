import { createFileRoute, notFound } from "@tanstack/react-router"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"

import { createMDXComponents } from "@/components/mdx-components"
import { source } from "@/source"

export const Route = createFileRoute("/docs/$")({
  component: DocPage,
})

function DocPage() {
  const { _splat } = Route.useParams()
  const slug = _splat ? _splat.split("/").filter(Boolean) : []
  const page = source.getPage(slug)

  if (!page) {
    throw notFound()
  }

  const MarkdownX = page.data.body

  return (
    <DocsPage tableOfContent={{ style: "clerk" }} toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MarkdownX components={createMDXComponents(`docs/${page.path}`)} />
      </DocsBody>
    </DocsPage>
  )
}
