# Phase 0 Accessibility & SEO Audit

**Date:** 2026-08-09  
**Scope:** Phase 0 only — discovery, blocking semantic fixes, MSW bootstrap resilience, route/indexing inventory  
**Page checked live:** `http://127.0.0.1:5174/contacts`  
**Stack preserved:** React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, Vanilla CSS

## Executive summary

Phase 0 is implemented without changing the FSD architecture, API contracts, business logic, framework, or dependencies.

The main confirmed defects addressed were:

1. Service and fallback pages could render a second `<main>` and duplicate `id="main-content"` inside `RootLayout`.
2. MSW startup failures stopped before React mounted, leaving a blank local preview.
3. E2E route expectations referenced headings that no longer matched the approved current page copy.
4. The application had no production-owned `robots.txt` or `sitemap.xml` generation and no documented route/indexing matrix.

The public rendering blocker remains intentionally deferred to the accepted ADR-0001 SSR/prerender migration. Phase 0 records that boundary; it does not duplicate server rendering or HTTP status logic in the SPA.

## Phase 0 changes

### 1. Semantic shell and skip-link target

Changed:

- [src/shared/ui/placeholder/Placeholder.tsx](../../src/shared/ui/placeholder/Placeholder.tsx)
- [src/pages/not-found/ui/NotFoundPage.tsx](../../src/pages/not-found/ui/NotFoundPage.tsx)
- [src/pages/ui-preview/ui/UiPreviewPage.tsx](../../src/pages/ui-preview/ui/UiPreviewPage.tsx)

The layout-owned `<main id="main-content">` remains the single landmark and skip-link target. Route content now uses `<section>` instead of nesting another `<main>` or reusing the layout id.

Live DOM verification on `/contacts` after the fix:

- `mainCount: 1`
- `mainIds: ["main-content"]`
- `h1Count: 1`
- `h1Text: ["Контакты"]`

The same correction covers the not-found and development preview routes so they do not regress the landmark contract.

### 2. MSW bootstrap resilience

Changed:

- [src/app/main.tsx](../../src/app/main.tsx)
- [src/mocks/browser.ts](../../src/mocks/browser.ts)
- [src/app/bootstrap/BootstrapError.tsx](../../src/app/bootstrap/BootstrapError.tsx)
- [src/app/bootstrap/bootstrap-error.module.css](../../src/app/bootstrap/bootstrap-error.module.css)

The worker configuration now declares the worker URL and root scope explicitly and fails fast when Service Worker support is unavailable. Bootstrap errors are caught before application rendering and produce an accessible recovery screen with:

- one `main` landmark;
- one `h1`;
- a concise explanation;
- expandable technical details;
- an explicit reload action.

In the managed browser, Playwright intentionally blocks Service Worker registration and MSW reports `Cannot read properties of undefined (reading 'active')`. The previous result was a blank screen. The current result is an actionable diagnostic page, so the failure is visible and does not masquerade as a successful empty application.

### 3. Route copy/test reconciliation

Changed [tests/e2e/routing.spec.ts](../../tests/e2e/routing.spec.ts) to match the current approved source copy:

- Home: `Строительные материалы для профессионалов`
- Catalog: `Каталог товаров`

No page business logic was changed for this task.

### 4. Route/indexing inventory and SEO assets

Added:

- [docs/route-indexing-matrix.md](../../docs/route-indexing-matrix.md)
- [scripts/seo-assets.ts](../../scripts/seo-assets.ts)

Updated:

- [vite.config.ts](../../vite.config.ts)
- [tsconfig.node.json](../../tsconfig.node.json)

The Vite configuration now serves the following in development and writes them into `dist/` during production builds:

- `robots.txt` with intentional exclusions for cart/service/dev routes and query-string URLs;
- `sitemap.xml` containing only unconditional static indexable routes: `/` and `/catalog`.

Category and product URLs are intentionally not generated from fixtures. They require API-backed SEO eligibility and canonical resolution during the ADR-0001 SSR/prerender migration.

## Accessibility audit

### Automated audit status

The browser accessibility audit service failed with its own internal error:

```text
SyntaxError: Unexpected identifier 'Object'
```

Therefore no automated accessibility score is claimed. Findings below combine the live DOM check, source inspection, and existing project test coverage.

### Confirmed after Phase 0

| Check | Result | Evidence |
|---|---|---|
| Single main landmark on service page | Pass | Live `/contacts`: one `main` |
| Unique skip-link target | Pass | Live `/contacts`: only `id="main-content"` on layout main |
| Single page heading on service page | Pass | Live `/contacts`: one `h1`, `Контакты` |
| Semantic service-page content wrapper | Pass | `Placeholder` now renders `section` |
| Not-found route nested main risk | Pass | `NotFoundPage` now renders `section` |
| Dev-only UI preview nested main risk | Pass | `UiPreviewPage` now renders `section` |
| Bootstrap failure recovery | Pass | Visible diagnostic page with heading, details and reload button |

### Remaining accessibility findings outside Phase 0

- Mobile bottom navigation still contains desktop-hidden anchors that the SEO audit identifies as zero-dimension links. This is a later navigation refinement task.
- The mobile drawer still needs full focus trapping and opener restoration. This is explicitly listed in the later roadmap navigation task.
- Catalog filter label/control wiring remains a later discovery/forms task.

## SEO audit

### Live automated SEO result

The SEO audit was run against `http://127.0.0.1:5174/contacts` after the Phase 0 changes.

**Score: 0.75**

Passed:

- canonical present and valid;
- meta description present;
- HTTP status `200` for the current dev SPA route;
- descriptive link text for all 15 checked links;
- `robots.txt` syntax valid;
- text legibility 100%;
- no contrast issues reported by the audit service.

Reported failures:

1. **Crawlable anchors: 0.0** — four desktop-hidden mobile navigation links have zero dimensions. This remains outside Phase 0 and is recorded for the later navigation refinement task.
2. **Crawlability: 0.0 on `/contacts`** — intentional because the page emits `noindex, nofollow` and `robots.txt` disallows `/contacts` under the current placeholder-content policy.

The audit also reported `LCP/FCP: 3.956s` for this local placeholder route. This is local development evidence only and is not a production Core Web Vitals measurement.

### Generated asset verification

Production build output was inspected:

```text
User-agent: *
Allow: /
Disallow: /cart
Disallow: /contacts
Disallow: /privacy
Disallow: /terms
Disallow: /ui-preview
Disallow: /*?*
Sitemap: https://storefront.production.invalid/sitemap.xml
```

The sitemap contains:

- `https://storefront.production.invalid/`
- `https://storefront.production.invalid/catalog`

Live dev responses also returned:

- `/robots.txt`: `200 text/plain; charset=utf-8`
- `/sitemap.xml`: `200 application/xml; charset=utf-8`

### Remaining SEO blockers outside Phase 0

- Initial public HTML is still a client-only SPA shell.
- Unknown routes and missing entities still need server-correct `404` responses.
- Unhandled server failures still need server-correct `500` responses.
- Category/product metadata and dynamic sitemap URLs still require the accepted SSR/prerender route integration.
- Query-string indexing policy is intentionally conservative (`Disallow: /*?*`) until search/filter/sort/pagination policy is implemented.

These are not silently treated as complete; they remain the explicit ADR-0001 production migration boundary and later SEO refinement work.

## Validation results

| Check | Result | Notes |
|---|---|---|
| `npm run typecheck` | Pass | Clean TypeScript build |
| `npm run lint` | Pass | No ESLint warnings/errors |
| `npm run build` | Pass | Built with production environment values |
| `npm run verify:production-output` | Pass | 34 files; no MSW, handlers or fixtures |
| `npm run test` | Partial | 28/31 files passed; 103 tests passed, 3 tests failed in existing product-page/variant/dialog suites |
| `npm run test:e2e` | Blocked by environment | Playwright Chromium executable is not installed at the configured local path |
| Live semantic DOM check | Pass | One main, one skip target, one h1 on `/contacts` |
| Live SEO asset check | Pass | `robots.txt` and `sitemap.xml` served with correct content types |
| Browser accessibility audit | Tool failure | Audit service raised `SyntaxError: Unexpected identifier 'Object'` |
| Browser SEO audit | 0.75 | Intentional noindex/contact policy and hidden mobile links remain |

## Phase 0 definition of done

- [x] Phase 0 semantic shell defect fixed without architectural rewrite.
- [x] MSW bootstrap failure no longer leaves a blank screen; it provides actionable recovery UI.
- [x] Current route copy and E2E expectations are reconciled.
- [x] Route/indexing policy is documented.
- [x] `robots.txt` and `sitemap.xml` are generated without new dependencies.
- [x] React, TypeScript, Vite, FSD layers, API contracts and business logic are preserved.
- [x] Typecheck, lint, build and production-output verification pass.
- [ ] Full unit test suite is green — deferred existing failures are documented above.
- [ ] Playwright E2E suite is green — blocked by missing local browser executable.
- [ ] Public SSR/prerender and HTTP status migration is complete — explicitly deferred by ADR-0001 and outside Phase 0.
