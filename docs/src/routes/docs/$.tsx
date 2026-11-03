import { createFileRoute, notFound } from "@tanstack/react-router"
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"
import type { FC } from "react"

import { createMDXComponents } from "@/components/mdx-components"
import { source } from "@/source"
import { createPageHead, docTitle } from "@/tools/page-head"

const DocPage: FC = () => {
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

export const Route = createFileRoute("/docs/$")({
  head: ({ params }) => {
    const page = source.getPage(params._splat ? params._splat.split("/").filter(Boolean) : [])

    return createPageHead({
      title: docTitle(page?.data.title ?? "Page not found"),
      description: page?.data.description,
    })
  },
  component: DocPage,
})
