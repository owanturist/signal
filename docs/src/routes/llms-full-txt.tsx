import { source } from "@/source"
import { getLLMText } from "@/tools/get-llm-text"

export async function loader() {
  const scanned = await Promise.all(source.getPages().map(getLLMText))

  return new Response(scanned.join("\n\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
