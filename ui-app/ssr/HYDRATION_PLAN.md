# Server-rendered pages with hydration

Goal: a public page of ANY app arrives as real HTML, then React hydrates it instead of rendering
from an empty `#app`. Faster first paint, and crawlers read the page. Nothing here is specific to a
product: the server render, the first-render page, the style preload and the fixes below are all
platform code. Eligibility is a platform rule (Phase 2), not a list of pages: anonymous visitor,
page not wrapped in the shell (shell later), render within a time budget. Anything else, or any
failure, keeps today's path (bootstrap data + empty `#app` + `createRoot`), and a hydration failure
in the browser already falls back to a client render.

## Where we started (2026-10-10)

- `ui-app/ssr` serves every page with bootstrap data, meta tags and an EMPTY `#app`. A
  `<noscript>` block now carries the page's static Text for crawlers that run no JavaScript.
- The client hydrates when the HTML contains `#_rendered` (written by `App.tsx`), and falls back
  to `createRoot` if hydration throws (`index.tsx`).
- Earlier attempts: TanStack Router with a SEPARATE server component set (`537a9908`, removed
  Jan 2026: a second component set can never produce the client's DOM); and the right shape, the
  REAL client `App` with `renderToPipeableStream` behind a serial queue (`8a6ea204`, branch
  `feature/translations`, Nov 2025, never merged), which hit hydration mismatches.

## Phase 0 results (local, 2026-10-11)

Harness: session scratchpad `hydration/` (`render.js` = jsdom at the page URL + the SSR document's
own bootstrap + `client/dist-server/serverEntry.js`; `hydrate_test.py` = that HTML in `#app`, the
dev client, React's mismatch report, and how many server nodes React kept; `sweep.sh` = both, at
1440 and 390). React stops at the FIRST mismatch, so each fix revealed the next.

Server render: 200-300 ms per page. Hydration: the five landing pages (authzump `home`, sitezump
`newHome`, leadzump `home`, marketingai `home`, appbuilder `builderLanding`) at 1440 and 390, and
12 of 14 other local apps' default pages at 1440, with 0 mismatches and React keeping the server's
nodes (a node or two per page re-renders on its own afterwards). The other 2 were local data: the
SSR could not resolve those apps (`appCode: nothing`).

Fixed (local, uncommitted):

1. **The page never rendered.** `RenderEngineContainer` loaded the page in an effect and returned
   `<></>` until then, so a server render (no effects) and the browser's first render were both
   empty. It now takes the bootstrapped page on the first render (`bootstrappedPage()`, non-shell
   pages only) and skips the mount effect's first load, so `Store.urlDetails` is still written
   once (twice would count the arrival twice).
2. **Build version.** `AppStyle` stamps `?v=<buildVersion>` on the stylesheet; the server bundle
   must carry the client bundle's version (`webpack.server.js` sets none).
3. **Lazy style JSON.** 22 components keep style properties in `/styleProperties/<Name>.json`.
   One rule (`src/ssr/stylePropertyComponents.ts`): the server applies, and the browser preloads
   before `hydrateRoot`, exactly the ones the page definition uses. Loading more on either side
   changes that side's style output. Later: put them in the bootstrap so the browser fetches none.
4. **`<style>` with several children.** React's server renderer emits `<style></style>` for a
   style element with array children; the browser renders the text. Link and Menu now join their
   rules into one string (the only two on public pages; SceneEditorStyle is editor-only).
5. **Markdown lost plain text.** `parseInline.ts` decoded runs with `innerText`, which jsdom does
   not have; `textContent` is identical for a detached element and works on both.

Confirmed, to build in Phase 1:

6. **Device.** `setDeviceType()` (`App.tsx` import) reads `document.body.offsetWidth` (0 in jsdom,
   a phone) and components resolve styles from `Store.devices` in JS. Server and browser must use
   the same width for the first render: the server picks it from the request (User-Agent / Client
   Hints, a few width classes), sends it in the bootstrap, the browser's first render uses it, and
   the real width is applied after hydration.
7. **SSO bounce.** An anonymous first visit to an SSO app (`__SSO_BEACON_HOST__`) leaves at once
   for the beacon (`/hassso?mode=bounce`) and returns with `?sso=none`, then reloads; the guard
   `localStorage.ssoCheckedAt` lasts 10 s. So the server HTML is seen only briefly, and most
   anonymous full loads pay the round trip regardless of SSR. Worth a non-navigating check.
8. **authzump `privacyPolicy`: `<a>` inside `<a>`.** React warns on a normal load today; browsers
   split nested anchors, so that page can never match. Find which component nests them.

Found on the way (not hydration):

9. **No CSP on cached pages.** `handlePageRequest` answers `HIT-HTML` / `HIT-HTML-GZIP` before
   `setResponseHeaders` runs, so a page served from the SSR's HTML cache carries no
   `Content-Security-Policy` at all, on every environment; only a cache MISS sends the app's CSP.
10. **Cache invalidation found nothing locally.** `POST /api/cache/invalidate {"appCode":"*"}`
    answered `invalidated: 0` twice while a cached copy was then served (`HIT-HTML-GZIP`). Check
    the pattern `invalidateCache` scans for against the keys `setCachedHtml` writes.

Local testing with SSR: run the SSR with `CLIENT_BUNDLE_URL=/` (it then loads the dev server's
`/index.js` from the page's own origin, sets no cdnPrefix, and adds 'unsafe-eval' to the app's CSP
because the dev bundle evals), and open `/__ssr/on` on any `*.local.modlix.com` app host (local
nginx then sends that host's page requests to 3080; `/__ssr/off` undoes it).

Not yet looked at: images (the server renders `compImage` without its `<img>`; Image loads on
intersection), random DOM ids, lazy components, shell-wrapped pages (modlix `newHome`), concurrent
renders (the store is a module singleton: serialize or isolate).

## Phases

**1. Make it production-shaped.** Device class from the request into the bootstrap (6); move the
`index.tsx` import-time globals into one module both entries import; run the render inside the SSR
service with a jsdom (or a lighter shim) per render, serialized, with a time budget; shell pages.

**2. Serve it.** `htmlRenderer.ts` puts the server HTML into `#app` for eligible requests, falls
back to today's empty `#app` on timeout or error, and adds the device class to the HTML cache key.

**3. Roll out** on dev, then stage: authzump public pages first, then every app, watching
hydration errors (report them from `onRecoverableError`) and first paint. Then prod.

The `<noscript>` block stays as the fallback for anything not server-rendered.
