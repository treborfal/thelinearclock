# The Linear Clock

Marketing site for a concept product — a clock that shows the time as a line
rather than a circle. Static HTML/CSS/JS, no build step, no framework.

## Deploy

- Hosted on **GitHub Pages** from `origin/main`, custom apex domain
  `thelinearclock.co.uk` (see `CNAME`). Pushing to `main` deploys.
- Use the **`ship`** skill to stage, commit and push. `.DS_Store` files are
  never committed.
- `_headers` holds a CSP, but GitHub Pages ignores `_headers` — it only takes
  effect if the site is ever moved to Cloudflare/Netlify. Note it doesn't
  currently allow `cdn.jsdelivr.net` under `style-src`.

## Local development

- Use the **`run-local`** skill (Python http.server on port 8080). No build.

## Conventions

- **Flat-file URLs.** Every internal link points at `index.html`,
  `about.html`, `shop.html`, `privacy.html`, `demo.html` — never an
  extensionless route. Apply to nav, mobile nav, logo, CTAs, footer, and the
  404 recovery links.
- **Cache-busting.** Local CSS/JS are linked with a `?v=N` query string
  (e.g. `styles.css?v=33`). When you change one of those files, bump `N` in
  **every** HTML page that links it. `styles.css` is linked from
  `index/about/privacy/404`; `shop-form.js` from all four plus nothing else
  loads it on `demo`.
- The `<head>` (meta, favicons, font links, stylesheet links, GA snippet) is
  copy-pasted across all pages — there is no templating. Edits to shared head
  markup must be repeated per page.

## Structure notes

- `css/styles.css` — all site styling. `css/clock.css` — the live homepage
  clock. `css/demo-clock.css` — the interactive `demo.html` clock (separate,
  some overlap with clock.css).
- `js/script.js` — site-wide behaviour + homepage clock + hand-rolled navbar
  toggle and carousel (no jQuery/Bootstrap JS). `js/shop-form.js` — the
  "register interest" form. `js/demo-clock.js` — demo page only.
- Signup form posts to a Google Apps Script endpoint (`mode: "no-cors"`);
  backend source is in `server/google-apps-script/Code.gs`.
- Icons come from Font Awesome 6 (CDN). The grid and navbar still use
  Bootstrap 3.4.1 CSS from the jsdelivr CDN — it's EOL; replacing it with a
  minimal hand-written grid is a known future cleanup.
