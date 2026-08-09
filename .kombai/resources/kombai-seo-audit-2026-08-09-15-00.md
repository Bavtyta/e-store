# SEO Audit — BELT E-store

**Date:** 2026-08-09  
**Audited URL:** `http://127.0.0.1:5174/`  
**Mode:** live Vite preview with `VITE_MSW_ENABLED=false`  
**Scope:** SEO and indexability only; no source code changed.

## Automated audit summary

| Check | Result | Evidence |
|---|---|---|
| Canonical | Pass | Valid `rel=canonical` emitted after app mount. |
| Meta description | Pass on mounted root | `Строительные материалы для профессионалов. Надежные поставки промышленных комплектующих.` |
| HTTP status for root | Pass | `200`. |
| Crawlability | Pass for tested bot profiles | Generic/Google/Bing/DuckDuckGo/Archive bots were not blocked. |
| Font legibility | Pass with caveat | 94% legible text; no contrast issue reported by the audit service. |
| Crawlable anchors | Fail | `/catalog` and `/contacts` mobile navigation anchors were present with zero dimensions when desktop navigation was active. |
| robots.txt | Fail | 16 syntax errors because `/robots.txt` returned the Vite HTML shell. |

## Verified route asset behavior

| Request | Status | Content-Type | Finding |
|---|---:|---|---|
| `/robots.txt` | 200 | `text/html` | Invalid robots response; SPA fallback. |
| `/sitemap.xml` | 200 | `text/html` | Sitemap is absent; SPA fallback. |
| `/favicon.ico` | 404 | — | Favicon missing. |
| `/does-not-exist` | 200 | `text/html` | Soft-404 risk in the SPA preview. |

## Source-level findings

1. `index.html:1-10` contains only the root mount point. Route content and metadata require JavaScript.
2. `src/app/main.tsx:20-39` mounts the application only after bootstrap; when MSW registration fails, no content is rendered.
3. `src/shared/lib/page-metadata/MetadataElements.tsx:7-29` correctly emits title, description, canonical, robots, Open Graph and Twitter tags, but only after hydration in the current SPA architecture.
4. `src/shared/lib/page-metadata/pageMetadata.ts:107-135` is a good pure descriptor source and should be reused by the future server route metadata adapter.
5. `src/app/router/routes.ts:91-97` renders a client-side not-found page but cannot produce an HTTP 404 in the current static SPA.
6. No `robots.txt`, `sitemap.xml`, JSON-LD or `application/ld+json` was found in `public`, `src` or `index.html`.
7. Product/category SEO fields and canonical paths exist in the domain models and page metadata calls; this is a strong foundation once server rendering exists.
8. Search/sort/page URL combinations are supported in `src/widgets/catalog-content/ui/CatalogContent.tsx:29-71`, but an explicit index/noindex/canonical policy is not visible for all combinations.
9. Product/category loading/error/not-found states are deliberately marked `noindex, nofollow`, which is a good fail-safe, but generic dynamic canonical fallbacks should be avoided in server output.
10. Contacts/privacy/terms are currently `noindex, nofollow`; this is acceptable for legal/service policy only if it is an explicit product decision. A verified contact page may deserve indexing for trust/local discovery.

## Priority actions

### P0 — release blockers

- Implement the accepted ADR-0001 hybrid SSR/prerender strategy without changing the React/Vite/FSD stack.
- Generate valid production `robots.txt` and `sitemap.xml` for the real origin.
- Return server 404 for unknown routes/entities and 500 for unhandled server failures.

### P1 — high impact

- Add JSON-LD for `Product`, `Offer` only for real fixed prices, `BreadcrumbList`, `Organization` and `WebSite`.
- Define canonical/noindex policy for search, filter, sort and pagination URLs.
- Make error/loading metadata route-aware and avoid canonicalizing missing dynamic slugs to generic `/product` or `/catalog`.

### P2/P3 — hygiene

- Remove zero-dimension duplicate mobile anchors from crawlable DOM where possible.
- Add favicon/approved brand assets.
- Measure font loading/CWV on staging and decide whether approved self-hosting is required.

## Important architecture constraint

Do not treat a framework rewrite as the SEO fix. The project already has an accepted React Router Framework Mode decision in `docs/adr/0001-rendering-strategy.md:138-157`; implementation should preserve current API contracts, mappers, FSD boundaries, local cart and metadata source.
