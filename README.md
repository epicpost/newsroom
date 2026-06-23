# EpicPost Newsroom

Server-rendered newsroom built with **Next.js (App Router)**. Pages are emitted
as complete HTML documents by Route Handlers (`route.ts`), with content fetched
from the MonoMCP CMS module (Strapi-like delivery API) and a bundled fallback so
the site always renders.

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- npm

## Setup

```bash
npm install
```

Configure environment variables in `.env` (already present):

```bash
CMS_API_BASE=https://api.monomcp.com   # CMS delivery API base
CMS_API_KEY=                           # read-only `mweb_` key (blank = use local fallback)
CMS_POSTS_TYPE=newsroom-post           # content-type UID for posts
CMS_HEADER_MENU=main-header            # navigation menu key
```

Leave `CMS_API_KEY` blank to run entirely from the bundled
`cms/newsroom-post.entities.json` fallback — no CMS connection required.

## Run

```bash
npm run dev      # development server with hot reload  →  http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build         →  http://localhost:3000
```

```bash
npm run typecheck   # tsc --noEmit
```

## Routes

| Path                | Description                                                        |
| ------------------- | ----------------------------------------------------------------- |
| `/`                 | CMS-driven news feed (hero + card grid), with local JSON fallback |
| `/<slug>`           | Article detail page (Markdown rendered to HTML)                   |
| `/newsroom`         | Static newsroom landing page — reuses the captured reference layout, components, and styles; text is static (not wired to the CMS) |

## Project layout

```
src/app/
  route.ts                 # "/" news feed
  [slug]/route.ts          # article detail
  newsroom/
    route.ts               # serves the static newsroom landing page
    page.html              # HTML shell (reused layout/components/markup)
  _lib/
    cms.ts                 # CMS delivery client (content + navigation, 60s cache, graceful fallback)
    posts.ts               # newsroom posts content layer (CMS → normalized, local JSON fallback)
    render-markdown.ts      # Markdown → HTML pipeline (remark/rehype/shiki)
  _shared/
    site-shell.ts          # shared header/footer + HTML document wrapper
cms/
  newsroom-post.entities.json   # local content fallback (used when CMS is unset/unreachable)
public/
  pinterest-newsroom.css   # self-hosted stylesheet for the /newsroom page
```

## How content loading works

1. `_lib/cms.ts` calls the CMS delivery API
   (`GET {CMS_API_BASE}/api/content/{type}` and `/api/navigation/{menu}`) with
   `Authorization: Bearer {CMS_API_KEY}`.
2. Responses are cached in memory for 60 seconds.
3. If the CMS is unconfigured or unreachable, the site falls back to
   `cms/*.entities.json` (and static default navigation), so it never goes dark.
