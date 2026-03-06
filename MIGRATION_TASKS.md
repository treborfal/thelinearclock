# Static GitHub Pages Migration Tasks

## Phase 1 — Foundation (in progress)
- [x] Audit current PHP include/layout/routing structure.
- [x] Define migration task plan and sequencing.
- [ ] Create static HTML shell pages (`index.html`, `about.html`, `shop.html`, `privacy.html`, `demo.html`).
- [x] Add a GitHub Pages compatible `404.html` starter page.
- [ ] Replace PHP-only dynamic bits (e.g. `date("Y")`) with client-side/static alternatives.

## Phase 2 — URL and Navigation Compatibility
- [ ] Replace extensionless links (`/about`) with static-safe links (`/about.html` or folder-style `/about/`).
- [ ] Standardize navigation and footer links across all pages.
- [ ] Decide final URL strategy:
  - [ ] Flat files (`about.html`)
  - [ ] Directory routes (`about/index.html`)

## Phase 3 — Asset Path Hardening for GitHub Pages
- [ ] Remove root-absolute asset paths where needed (`/css/...`, `/js/...`, `/icons/...`).
- [ ] Convert to relative or base-aware paths compatible with project-site deployments.
- [ ] Verify image/icon/font loading from GitHub Pages URL prefix.

## Phase 4 — JavaScript and Legacy Cleanup
- [ ] Confirm required scripts per page and remove unneeded global includes.
- [ ] Remove/replace missing jQuery fallback reference (`/js/vendor/jquery.min.js`).
- [ ] Evaluate removal of legacy IE10 viewport workaround assets.
- [ ] Decide whether to keep both GA4 and legacy Universal Analytics snippets.

## Phase 5 — Forms and External Integrations
- [ ] Verify `shop` email form works from GitHub Pages origin with CORS.
- [ ] Move inline form script into a dedicated JS file (optional cleanup).
- [ ] Validate analytics events still fire after static conversion.

## Phase 6 — Validation and Cutover
- [ ] Run link/path validation locally.
- [ ] Smoke-test all routes/pages (`home`, `about`, `shop`, `privacy`, `demo`, `404`).
- [ ] Remove or archive legacy PHP files once static pages are confirmed.
- [ ] Update deployment docs for GitHub Pages.
