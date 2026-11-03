import type { InferPageType } from "fumadocs-core/source"

import type { source } from "@/source"

// `BASE_URL` is `/` or `/<base>/`
const BASE = import.meta.env.BASE_URL.replace(/\/$/u, "")

export async function getLLMText({ data, url }: InferPageType<typeof source>): Promise<string> {
  const processed = await data.getText("processed")

  const frontmatter = [
    "---",
    `title: ${data.title}`,
    data.description ? `description: ${data.description}` : null,
    `url: ${BASE}${url}`,
    data.lastModified ? `lastModified: ${data.lastModified.toISOString()}` : null,
    "---",
  ]
    .filter((line) => line != null)
    .join("\n")

  return `${frontmatter}

# ${data.title} (${BASE}${url})

${processed}`
}
