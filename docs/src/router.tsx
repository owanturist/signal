import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./route-tree.gen"

export function createAppRouter() {
  return createRouter({
    routeTree,
    // Preload route code + data on link hover/focus. Fumadocs already sets
    // this on its internal `<Link>`s; the router-level default extends the
    // same behaviour to any custom `<Link>` we add later.
    defaultPreload: "intent",
    // Restore scroll position on browser back/forward and reset scroll on
    // client-side navigation. TanStack Start does not do this by default.
    scrollRestoration: true,
  })
}

export function getRouter() {
  return createAppRouter()
}
