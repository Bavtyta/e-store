# Independent axe accessibility audit — 2026-08-09

## Scope

Added an independent `@axe-core/playwright` suite so the project has a reliable accessibility gate while the external browser audit evaluator is failing with:

```text
SyntaxError: Unexpected identifier 'Object'
```

The suite covers:

- `/`
- `/catalog`
- `/catalog/truby/pnd`
- `/product/truba-pnd-pe100-pitevaya`
- `/cart`
- `/contacts`

Each route must render its expected heading and produce zero axe violations for `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa` tags.

## Initial findings

The first run produced **2 passed, 4 failed**:

1. `color-contrast` on product availability badges:
   - shared success badge used `#16a34a` on `#e6f4ea` with a 2.9:1 ratio;
   - compact product-card success badge used white on `#16a34a` with a 3.29:1 ratio.
2. `select-name` on the catalog material filter.
3. The test expected the cart empty state to be an `h1`, while the existing `EmptyState` component intentionally renders an `h2` inside the route-owned status section.
4. The category heading assertion was not exact and matched the product card heading containing `ПНД`.

## Fixes applied

- [src/shared/ui/badge/badge.module.css](../../src/shared/ui/badge/badge.module.css): shared success badge now uses the existing darker `--color-success-text` token.
- [src/entities/product/ui/product-card.module.css](../../src/entities/product/ui/product-card.module.css): compact in-stock badge now uses `--color-success-text` as its background.
- [src/pages/catalog/ui/catalog-page.module.css](../../src/pages/catalog/ui/catalog-page.module.css): category/filter headings now use the higher-contrast `--color-text-secondary` token.
- [src/pages/catalog/ui/CatalogPage.tsx](../../src/pages/catalog/ui/CatalogPage.tsx): material select now has an explicit `label`/`htmlFor` and the price inputs have accessible names.
- [tests/e2e/accessibility.spec.ts](../../tests/e2e/accessibility.spec.ts): route heading assertions are exact and accommodate the existing cart empty-state heading level.

## Final result

```text
npm run test:a11y

6 passed (13.3s)
```

The full combined Playwright suite also passes:

```text
npm run test:e2e

18 passed (42.6s)
```

The independent axe suite is wired into CI through `npm run test:a11y` after the functional E2E smoke test.

## Boundaries

- axe catches automated rules; it does not replace keyboard, focus, screen-reader, content, or responsive review.
- The external audit-service evaluator remains a separate infrastructure issue. Its recommendations are documented in [accessibility-evaluator-service-recommendations-2026-08-09.md](./accessibility-evaluator-service-recommendations-2026-08-09.md).
