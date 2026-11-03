const SITE_NAME = "@owanturist/signal"

const SITE_DESCRIPTION =
  "A lightweight, fine-grained reactive state management library for JavaScript and React"

interface PageHeadInput {
  /** Full document title. */
  title: string
  description?: string
}

/** Document title of a documentation page, e.g. `Getting Started | @owanturist/signal`. */
function docTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`
}

function createPageHead({ title, description = SITE_DESCRIPTION }: PageHeadInput) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }
}

export { SITE_DESCRIPTION, SITE_NAME, createPageHead, docTitle }
