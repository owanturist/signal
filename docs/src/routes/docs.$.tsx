import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page"
import type { LoaderFunctionArgs } from "react-router"
import { useParams } from "react-router"

import { createMDXComponents } from "@/components/mdx-components"
import { source } from "@/source"
import { getLLMText } from "@/tools/get-llm-text"

const MD_EXT_LENGTH = -3

export async function loader({ params }: LoaderFunctionArgs) {
  const splat = params["*"] ?? ""

  if (splat.endsWith(".md")) {
    const slug = splat.slice(0, MD_EXT_LENGTH).split("/").filter(Boolean)
    const page = source.getPage(slug)

    if (!page) {
      throw new Response("Not Found", { status: 404 })
    }

    return new Response(await getLLMText(page), {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    })
  }

  return {}
}

export default function DocPage() {
  const { "*": splat } = useParams()
  const slug = splat ? splat.split("/").filter(Boolean) : []
  const page = source.getPage(slug)

  if (!page) {
    throw new Response("Not Found", { status: 404 })
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
