import { createFromSource } from "fumadocs-core/search/server"

import { source } from "@/source"

const CODE_LANGUAGE_HINT_RE = /\{:\w+\}/gu

/** Exported search indexes of all documentation pages, to be served as a static JSON file. */
function getSearchIndex(): Promise<unknown> {
  return createFromSource(source, {
    buildIndex: ({ data, url }) => ({
      id: url,
      url,
      title: data.title,
      description: data.description,
      structuredData: {
        headings: data.structuredData.headings,
        // drop the `{:ts}` inline code language hints from the searchable text
        contents: data.structuredData.contents.map((content) => ({
          ...content,
          content: content.content.replace(CODE_LANGUAGE_HINT_RE, ""),
        })),
      },
    }),
  }).export()
}

export { getSearchIndex }
