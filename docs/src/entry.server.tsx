import { renderToString } from "react-dom/server"
import { type EntryContext, ServerRouter } from "react-router"

export default function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
) {
  const html = renderToString(<ServerRouter context={context} url={request.url} />)

  headers.set("Content-Type", "text/html")

  return new Response(`<!DOCTYPE html>${html}`, {
    status,
    headers,
  })
}
