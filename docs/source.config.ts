import {
  type RehypeCodeOptions,
  rehypeCode,
  rehypeCodeDefaultOptions,
} from "fumadocs-core/mdx-plugins"
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"

const rehypeCodeOptions = {
  themes: {
    light: "github-light",
    dark: "github-dark",
  },
  // https://fumadocs.dev/docs/headless/mdx/rehype-code#inline-code
  inline: "tailing-curly-colon",
} satisfies RehypeCodeOptions

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
})

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    rehypePlugins: [[rehypeCode, rehypeCodeOptions]],
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      transformers: [...(rehypeCodeDefaultOptions.transformers ?? [])],
    },
  },
})
