# React Router File-Based Routing: Full Conventions Reference

## Setup

Install the package and configure `app/routes.ts`:

```bash
pnpm add @react-router/fs-routes
```

```ts
// app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes"
import { flatRoutes } from "@react-router/fs-routes"

export default flatRoutes() satisfies RouteConfig
```

Options:
```ts
flatRoutes({
  ignoredRouteFiles: ["home.tsx"],   // files to exclude
  rootDirectory: "file-routes",       // relative to app dir (default: "routes")
})
```

Mix file-based and config-based:
```ts
import { type RouteConfig, route } from "@react-router/dev/routes"
import { flatRoutes } from "@react-router/fs-routes"

export default [
  route("/", "./home.tsx"),
  ...(await flatRoutes()),
] satisfies RouteConfig
```

---

## Naming Conventions Cheatsheet

| Convention | Filename | URL |
|---|---|---|
| Basic route | `about.tsx` | `/about` |
| Dot = path separator | `concerts.trending.tsx` | `/concerts/trending` |
| Dynamic segment | `concerts.$city.tsx` | `/concerts/:city` |
| Multiple dynamics | `concerts.$city.$date.tsx` | `/concerts/:city/:date` |
| Optional segment | `($lang).about.tsx` | `/about` and `/en/about` |
| Splat (catch-all) | `$.tsx` | `/*` (404 fallback) |
| Named splat | `files.$.tsx` | `/files/*` |
| Index route | `_index.tsx` | `/` |
| Child index | `concerts._index.tsx` | `/concerts` |
| Pathless layout | `_auth.tsx` | (no URL - layout only) |
| Escape layout nesting | `concerts_.mine.tsx` | `/concerts/mine` (not in concerts layout) |
| Escape dot | `sitemap[.]xml.tsx` | `/sitemap.xml` |
| Escape dollar | `dolla-bills-[$].tsx` | `/dolla-bills-$` |
| Literal extension | `reports.$id[.pdf].ts` | `/reports/:id.pdf` |

---

## Special Characters

| Character | Position | Meaning |
|---|---|---|
| `.` | Between segments | Path separator + layout nesting |
| `$` | Prefix on segment | Dynamic URL parameter |
| `$` | Standalone at end of path | Splat (catch-all) |
| `_` | Leading (before name) | Pathless layout (no URL segment) |
| `_` | Trailing (after parent name) | Opt out of parent layout |
| `_index` | Full filename segment | Index route |
| `(segment)` | Wrapping segment | Optional |
| `[chars]` | Wrapping characters | Escape special meaning |

---

## Layout Nesting Rules

When `concerts.tsx` exists, ALL files matching `concerts.*.tsx` render inside its `<Outlet />`:

```
routes/
├── concerts.tsx           ← parent layout
├── concerts._index.tsx    → /concerts      (inside concerts layout)
├── concerts.trending.tsx  → /concerts/trending (inside concerts layout)
└── concerts_.mine.tsx     → /concerts/mine (NOT inside concerts layout)
```

Pathless layout groups (leading `_`):

```
routes/
├── _auth.tsx              ← layout, no URL
├── _auth.login.tsx        → /login    (inside _auth layout)
└── _auth.register.tsx     → /register (inside _auth layout)
```

---

## Folder-Based Organization

A folder with `route.tsx` is equivalent to a flat file. Other files in the folder are co-located components, NOT routes:

```
routes/
├── concerts.$city/
│   ├── route.tsx          ← the actual route module
│   ├── city-map.tsx       ← co-located component (not a route)
│   └── utils.ts           ← co-located util (not a route)
└── concerts.tsx
```

Equivalences:
- `routes/concerts.tsx` ↔ `routes/concerts/route.tsx`
- `routes/concerts._index.tsx` ↔ `routes/concerts._index/route.tsx`

---

## Resource Routes

A route with no `default` export is a resource route (serves non-HTML responses):

```ts
// routes/api.reports.$id[.pdf].ts
export async function loader({ params }: Route.LoaderArgs) {
  const pdf = await generatePDF(params.id)
  return new Response(pdf, {
    headers: { "Content-Type": "application/pdf" },
  })
}
// No default export → resource route
```

Link to resource routes with `<a>` or `<Link reloadDocument>` (not plain `<Link>`).

---

## Special Files

| File | Required | Purpose |
|---|---|---|
| `app/root.tsx` | Yes | Root layout, renders `<html>`, parent of all routes |
| `app/routes.ts` | Yes | Route configuration (maps URLs to modules) |
| `react-router.config.ts` | No | App config (`appDirectory`, `ssr`, `prerender`, etc.) |
| `app/entry.server.tsx` | No* | Server rendering entry point |
| `app/entry.client.tsx` | No | Browser hydration entry point |

*Required for non-Node.js runtimes. Reveal defaults: `npx react-router reveal`

### root.tsx exports

```tsx
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><Meta /><Links /></head>
      <body>{children}<Scripts /><ScrollRestoration /></body>
    </html>
  )
}

export default function App() { return <Outlet /> }
export function ErrorBoundary() { /* ... */ }
export function HydrateFallback() { /* ... */ }
```

---

## Route Module Exports

| Export | Purpose |
|---|---|
| `default` | React component |
| `loader` | Server data loading (GET) |
| `action` | Server mutations (POST/PUT/PATCH/DELETE) |
| `clientLoader` | Client-side data loading |
| `clientAction` | Client-side mutations |
| `ErrorBoundary` | Error boundary |
| `HydrateFallback` | Loading fallback during hydration |
| `headers` | HTTP response headers |
| `links` | `<link>` elements |
| `meta` | Meta tags |
| `handle` | Arbitrary data for `useMatches()` |
| `shouldRevalidate` | Control revalidation |

---

## Config API Equivalents

When mixing config-based and file-based routing, config uses different syntax:

| File convention | Config API |
|---|---|
| `_index.tsx` | `index("./home.tsx")` |
| `about.tsx` | `route("about", "./about.tsx")` |
| `_auth.tsx` + children | `layout("./auth.tsx", [children])` |
| `concerts.*.tsx` nesting | `route("concerts", "./concerts.tsx", [children])` |
| `$param` | `:param` (colon, not dollar) |
| `($param)` | `:param?` (question mark) |
| `$` splat | `*` (asterisk) |
| path prefix without layout | `...prefix("concerts", [children])` |
