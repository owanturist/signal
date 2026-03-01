---
name: react-router-fs
description: React Router file-based routing conventions using @react-router/fs-routes and flatRoutes(). Use when setting up file-based routing, creating or renaming route files, migrating from config-based to file-based routing, or when you need to know what filename produces a given URL pattern (dynamic segments, splat routes, optional segments, layout nesting, pathless layouts, index routes, resource routes, escape sequences).
---

# React Router File-Based Routing

File-based routing maps filenames in `app/routes/` to URL paths using `flatRoutes()` from `@react-router/fs-routes`.

For full conventions, setup options, and config API equivalents: see [references/conventions.md](references/conventions.md).

## Quick Reference

| Want | Filename |
|---|---|
| `/about` | `about.tsx` |
| `/concerts/trending` | `concerts.trending.tsx` |
| `/concerts/:city` | `concerts.$city.tsx` |
| `/concerts` index | `concerts._index.tsx` |
| `/` index | `_index.tsx` |
| catch-all / 404 | `$.tsx` |
| `/files/*` | `files.$.tsx` |
| `/login` in auth layout | `_auth.login.tsx` (+ `_auth.tsx` layout) |
| `/concerts/mine` (skip layout) | `concerts_.mine.tsx` |
| `/sitemap.xml` | `sitemap[.]xml.tsx` |
| `/reports/:id.pdf` | `reports.$id[.pdf].ts` |
| `/en/about` or `/about` | `($lang).about.tsx` |

## Key Rules

1. **`.` = `/`** in the URL and creates layout nesting (all `concerts.*.tsx` render inside `concerts.tsx`'s `<Outlet />`)
2. **Leading `_`** = pathless layout (`_auth.tsx` wraps children without adding a URL segment)
3. **Trailing `_`** on parent name = escape layout nesting (`concerts_.mine.tsx` → `/concerts/mine` but NOT inside `concerts.tsx`)
4. **`$`** prefix = dynamic param; standalone `$` = splat
5. **`[chars]`** = escape special characters to be literal
6. **No `default` export** = resource route (serves raw Response, not HTML)
7. **Folder with `route.tsx`** = same as flat file; other files in the folder are co-located, not routes

## Setup

```ts
// app/routes.ts
import { type RouteConfig } from "@react-router/dev/routes"
import { flatRoutes } from "@react-router/fs-routes"

export default flatRoutes() satisfies RouteConfig
```
