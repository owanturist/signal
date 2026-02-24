declare module "*.mdx" {
  // biome-ignore lint/correctness/noUndeclaredDependencies: transitive dep from @mdx-js
  import type { MDXProps } from "mdx/types"

  const MDXComponent: (props: MDXProps) => JSX.Element
  export default MDXComponent
}
