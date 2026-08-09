# SEO audit — Phase 0 verification

**URL:** `http://127.0.0.1:5174/contacts`  
**Date:** 2026-08-09  
**Automated score:** 0.75

## Passed checks

- Canonical link is present and valid.
- Meta description is present.
- The dev route returns HTTP `200`.
- All 15 checked links use descriptive link text.
- `robots.txt` is syntactically valid.
- Text legibility is 100%; no contrast issues were reported.
- The Phase 0 Vite plugin serves `/robots.txt` and `/sitemap.xml` with the expected content types.

## Issues reported

### 1. Hidden mobile navigation anchors

**Severity:** Medium  
**Audit:** crawlable anchors score `0.0`; 4 zero-dimension links were reported for `/`, `/catalog`, `/cart` and `/contacts`.

**Evidence:** the desktop-hidden `MobileBottomNav` remains in the DOM and contains links that have zero dimensions at desktop widths.

**Recommendation:** consolidate navigation sources by breakpoint or prevent desktop-hidden navigation nodes from being treated as crawlable duplicate anchors. This belongs to the later navigation refinement task, not Phase 0.

### 2. Intentional noindex on contacts

**Severity:** Informational / policy-dependent  
**Audit:** crawlability score `0.0` because `/contacts` emits `noindex, nofollow` and `robots.txt` disallows `/contacts`.

**Evidence:** `ContactsPage` is still a placeholder route and its metadata explicitly sets `indexable: false`.

**Decision:** retain the noindex policy until approved contact content exists. Do not make placeholder content indexable merely to improve an audit score.

### 3. Local development timing

The audit reported `LCP/FCP: 3.956s`. This is local development evidence on a placeholder route and is not a production Core Web Vitals measurement. Production CWV measurement remains part of the staging validation phase.

## Phase 0 SEO assets

The generated route policy is:

```text
User-agent: *
Allow: /
Disallow: /cart
Disallow: /contacts
Disallow: /privacy
Disallow: /terms
Disallow: /ui-preview
Disallow: /*?*
Sitemap: http://127.0.0.1:5174/sitemap.xml
```

The sitemap contains only unconditional static indexable routes:

- `/`
- `/catalog`

Dynamic category/product URLs are intentionally deferred until API-backed SEO eligibility and canonical resolution are available in the accepted SSR/prerender migration.

## Rendering boundary

The current Vite SPA still produces client-generated route content and cannot return production-correct HTTP `404/500` statuses. This remains the explicit ADR-0001 migration boundary and was not implemented in Phase 0.

See the consolidated accessibility, SEO, validation and residual-risk report in [phase0-audit-2026-08-09.md](./phase0-audit-2026-08-09.md).
