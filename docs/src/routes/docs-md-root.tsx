import { source } from "@/source"
import { getLLMText } from "@/tools/get-llm-text"

export async function loader() {
  const page = source.getPage([])

  if (!page) {
    throw new Response("Not Found", { status: 404 })
  }

  return new Response(await getLLMText(page), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
