# Accessibility Audit — BELT E-store

**Date:** 2026-08-09  
**Audited pages:** root, catalog error state, product-not-found state, empty cart, contacts placeholder; source-level review of product, dialog, form, gallery and cart states.  
**Scope:** accessibility only; no source code changed.

> The browser automation's accessibility audit endpoint failed with `SyntaxError: Unexpected identifier 'Object'`. This report therefore combines live DOM evidence, static source review and existing accessibility-focused tests. It is not an automated WCAG score.

## Critical findings

| Severity | Issue | Evidence | Recommendation |
|---|---|---|---|
| Critical/High | Duplicate `main` landmark and duplicate `main-content` id on service pages | `RootLayout.tsx:13` renders the layout `main`; `Placeholder.tsx:9` renders a second `main` with the same id. Live `/contacts` DOM showed `mainCount: 2` and two `main-content` ids. | Make `Placeholder` a section/div within the existing layout main. Keep one skip target per route. |
| High | Catalog filter labels are not programmatically connected | `CatalogPage.tsx:78-108` uses standalone labels for price, diameter and material without `htmlFor`; price inputs are not wrapped by those labels. | Use stable ids and `htmlFor`, or existing `Input`/`NumberInput` components; give the checkbox group an appropriate group label. |
| High | Mobile menu focus can escape and is not restored | `Header.tsx:82-155` focuses the close button and handles Escape, but has no Tab trap and does not remember/restore the burger opener. | Implement a drawer focus trap and opener restoration; add `aria-controls` to the trigger. |
| Medium | Mobile navigation duplicate hidden anchors | `MobileBottomNav.tsx:69-92` stays in DOM while its root is `display:none` on desktop. Live SEO audit found zero-dimension `/catalog` and `/contacts` links. | Avoid duplicate crawlable navigation or use a single responsive navigation source; verify screen-reader tree on both breakpoints. |
| Medium | Account icon is a non-interactive future affordance | `Header.tsx:205-207` renders a `<span>` with a title, visually resembling a control. | Remove until available or expose it as explicit non-action text; do not give non-controls misleading affordance. |

## Positive findings

- `src/app/styles/global.css:88-91` provides a visible `:focus-visible` outline.
- `Header.tsx:172-175` includes a skip link.
- `Input.tsx:33-62` associates labels, hints and errors; it uses `aria-invalid`, `aria-describedby` and an alert role for errors.
- `Dialog.tsx:64-126` handles initial focus, Escape, Tab containment and opener restoration.
- `Breadcrumbs.tsx:14-29` uses `nav`, `ol`, links and `aria-current="page"`.
- `ProductGallery.tsx`, `ProductCard.tsx` and `CartContent.tsx` provide alt text/fallbacks and image dimensions when data is available.
- Product variants, gallery thumbnails and cart quantity controls have keyboard-focused tests in `src/mocks/product-page.integration.test.tsx` and `tests/e2e/routing.spec.ts`.
- Toasts, loading states, empty states and quantity changes use live regions with generally meaningful announcements.
- The project does not broadly use `div` click handlers as button substitutes in the reviewed flows.

## Additional observations

1. `ErrorState` uses `role="alert"`, while `EmptyState` uses `role="status"` and `aria-live="polite"`. This distinction is appropriate, but the visual shells should be made context-specific without removing the semantics.
2. `ProductDetails` exposes a hidden live announcement for variant changes and uses semantic `h1`, `h2`, `dl` and sections.
3. The service-page placeholder issue is likely to evade the current E2E matrix because `tests/e2e/routing.spec.ts:361-385` checks only the main commerce route set, not contacts/privacy/terms. Extend the matrix after fixing the shell.
4. Current header/icon controls use 40px dimensions (`tokens.css:102-105`, header CSS), which is below the project's recommended mobile touch target. Verify exact target policy with product accessibility QA and raise primary touch controls to at least 44px.
5. Browser-level contrast automation was unavailable due the audit endpoint failure. The project tokens and live rendered root did not show reported contrast issues in the SEO audit, but status colors and secondary text still require an automated WCAG contrast run once the endpoint is healthy.

## Validation checklist

- [ ] Exactly one `main` and one `main-content` id on every route.
- [ ] Exactly one logical `h1` on each page state.
- [ ] Skip link moves focus to the main landmark.
- [ ] Header drawer traps focus, closes with Escape and restores focus to opener.
- [ ] All filters have programmatic labels and keyboard operation.
- [ ] Product variant/gallery/quantity controls work without a pointer.
- [ ] Dialogs and live regions are announced without duplicate status noise.
- [ ] No horizontal overflow at 320, 375, 768, 1024 and 1440px.
- [ ] Automated accessibility scan and manual keyboard/screen-reader review pass on staging.
