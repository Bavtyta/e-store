# UI/UX, SEO & Conversion Audit — BELT E-store

**Дата:** 2026-08-09  
**Scope:** первый аудит всего storefront frontend без изменения исходного кода  
**Продукт:** B2C e-commerce строительных и промышленных материалов  
**Стек:** React 19, TypeScript, Vite, React Router 8.3.0, TanStack Query, Zustand, Axios, Zod, CSS Modules

> Код приложения не изменялся. Созданы только отчётные материалы в `.kombai/resources/`.

## Методология и ограничения

Проверены:

- `.kombai/project-ui-guidelines.md`;
- `docs/adr/0001-rendering-strategy.md`, `docs/tz.md`, `docs/frontend_architercture.md`, `docs/deployment-requirements.md`, `docs/release-checklist.md`, `docs/engineering_standards.md`;
- `package.json`, routing, FSD-слои, страницы, widgets, shared UI, API/MSW, токены и CSS Modules;
- `pict/reference` и `pict/main menu` как визуальное/UX-направление;
- live preview на `http://127.0.0.1:5174/` без MSW для визуальной проверки shell, empty/error/service states;
- live preview на `http://127.0.0.1:5173/` с MSW для проверки dev-потока.

Заполненные product/category states не удалось получить в live preview: на `5173` MSW не регистрирует Service Worker в управляемом браузере и блокирует bootstrap, а на `5174` API intentionally отсутствует. Filled-state выводы подтверждены исходным кодом и integration/E2E tests, где это возможно.

Автоматический SEO-аудит выполнен на root route. Автоматический accessibility-аудит браузерного сервиса завершился внутренней `SyntaxError: Unexpected identifier 'Object'`, поэтому accessibility выводы основаны на live DOM-проверках, исходном коде и проектных тестах; это явно отмечено в отдельном отчёте.

---

# A. Executive Summary

## Итоговая оценка

Проект имеет хорошую основу для MVP: FSD-структура, разделение server/client state, типизированные доменные модели, Zod-валидация, единый API client, URL-state для поиска/сортировки, базовые loading/error/empty states и заметная работа над клавиатурной доступностью уже существуют.

Главный риск находится не в выборе React/Vite, а в публичном rendering/deployment контуре: сейчас это SPA, где HTML, metadata и маршрутные статусы появляются после JavaScript. Это уже корректно зафиксировано в ADR-0001, но остаётся release blocker для публичного storefront.

## Критические проблемы

1. **Публичная SEO-индексация не готова:** initial HTML содержит только `#root`; неизвестные URL, `/robots.txt` и `/sitemap.xml` на Vite fallback возвращают `200 text/html`.
2. **MSW-enabled dev preview не запускается в проверенном браузере:** Service Worker registration падает, `bootstrap()` не доходит до `createRoot().render()`, экран остаётся пустым.
3. **Сервисные страницы имеют некорректную landmark-семантику:** `Placeholder` рендерит второй `main` и повторяет `id="main-content"` внутри `RootLayout`; live DOM на `/contacts` показал `mainCount: 2` и два одинаковых id.
4. **Основные filter controls каталога не подключены к URL/API:** цена, диаметр и материал отображаются, но не меняют запрос, URL или результат.
5. **Корзина и checkout intentionally незавершены:** checkout только показывает Toast, а контакты — placeholder; для коммерческого сценария отсутствует завершённый путь до заявки/заказа.

## Главные возможности роста

- Сохранить текущую архитектуру и быстро улучшить discovery: persistent search, рабочие фильтры, direct add-to-cart из карточки, ясная цена/наличие/срок поставки.
- Сделать error/empty states компактными и контекстными, чтобы ошибка не доминировала над задачей пользователя.
- Довести trust layer: реальные контакты, доставка, условия оптовой заявки, гарантийные/юридические страницы.
- Реализовать зафиксированную ADR-0001 гибридную SSR/prerender стратегию без миграции на другой framework.

## Основные риски

- SEO-регрессия при визуальных изменениях, если важный текст или ссылки будут заменены на `div/button`.
- Потеря конверсии из-за неактивных фильтров, отсутствия direct add-to-cart и отсутствия контакта после checkout placeholder.
- Accessibility-регрессия из-за повторных landmarks, mobile drawer focus leakage и неассоциированных filter labels.
- Регрессия API/FSD-контрактов при добавлении фильтров и SSR loaders.

## Рекомендуемая стратегия

1. Сначала закрыть локальные blocking defects и семантику.
2. Затем реализовать product discovery и trust/conversion improvements поверх существующих моделей/API.
3. Параллельно подготовить отдельную SSR/prerender migration task по ADR-0001.
4. После этого повторить browser SEO/accessibility/CWV/E2E проверки на staging.

---

# B. Current Architecture

## Маршруты и слои

| Route | Реализация | Текущее состояние |
|---|---|---|
| `/` | `src/pages/home/ui/HomePage.tsx` | hero + категории |
| `/catalog` | `src/pages/catalog/ui/CatalogPage.tsx` | категории, поиск, сортировка, карточки, пагинация |
| `/catalog/*` | `src/pages/category/ui/CategoryPage.tsx` | category data, breadcrumbs, children, product list |
| `/product/:productSlug` | `src/pages/product/ui/ProductPage.tsx` | gallery, variants, price, availability, quantity, add-to-cart |
| `/cart` | `src/pages/cart/ui/CartPage.tsx` | persisted local cart, resolve API, quantity/remove/clear |
| `/contacts` | `src/pages/contacts/ui/ContactsPage.tsx` | placeholder |
| `/privacy` | `src/pages/privacy/ui/PrivacyPage.tsx` | placeholder |
| `/terms` | `src/pages/terms/ui/TermsPage.tsx` | placeholder |
| `*` | `src/pages/not-found/ui/NotFoundPage.tsx` | client-side 404 UI |
| `/ui-preview` | `src/pages/ui-preview/ui/UiPreviewPage.tsx` | dev-only |

Routing is declared in `src/app/router/routes.ts:9-100` and uses lazy-loaded route components. The root composition is `src/app/layouts/RootLayout.tsx:9-19` with `Header`, one layout `main`, `Footer`, and mobile bottom navigation.

## State and data

- Server state: TanStack Query in entity API segments.
- Client state: Zustand cart with versioned persistence and post-hydration resolve.
- URL state: `search`, `sort`, `page` in `src/widgets/catalog-content/ui/CatalogContent.tsx:29-71`.
- API: Axios + Zod + mappers; MSW is dev/test only.
- Styling: global tokens in `src/app/styles/tokens.css`, reset/accessibility baseline in `src/app/styles/global.css`, local CSS Modules everywhere else.

## What is already strong

- FSD boundaries and public module APIs are clear.
- API DTOs are validated before UI use.
- Product variant selection has keyboard tests and updates SKU/price/image.
- Product/cart images use `alt`, dimensions when available, and lazy loading for non-primary imagery.
- `Dialog` has Escape handling, focus containment and opener restoration.
- `Input` connects label, hint and error; global `:focus-visible` is present.
- Error messages hide internal API details.
- `npm run lint`, `npm run typecheck`, `npm run build` and `npm run verify:production-output` passed during this audit. The full `npm run test` currently has 4 failing tests in 3 files; see Risks and QA below.

## Documentation / implementation alignment

| Area | Evidence | Finding |
|---|---|---|
| Rendering | `docs/adr/0001-rendering-strategy.md:138-148`, `docs/frontend_architercture.md:585-619` | Docs correctly define SPA as MVP only and SSR/prerender as production target. This is an acknowledged release blocker, not a reason to change frameworks. |
| Production artifact | `docs/deployment-requirements.md:8-19`, `README.md:1-8` | Current `dist/` is explicitly not a public storefront artifact. |
| Design system | `pict/reference/industrial_standard/DESIGN.md:117-176`, `src/app/styles/tokens.css:3-112` | Token language is broadly aligned: yellow primary, slate surface, Inter, 8px rhythm, compact industrial geometry. |
| Page copy/tests | `tests/e2e/routing.spec.ts:8-26` vs `src/pages/home/ui/HomePage.tsx:25` and `src/pages/catalog/ui/CatalogPage.tsx:42` | E2E expectations use stale headings (`Материалы для монтажа...`, `Каталог материалов`) while source renders different copy. This is a product/content contract mismatch requiring an explicit decision. |
| React Router version | `package.json:26` | Repository currently installs `react-router ^8.3.0`; the configured preference says React Router v7. Record the actual version before any router work. |
| React Hook Form | `docs/engineering_standards.md:97-101`, `package.json:21-50`, `README.md:376-377` | Not a defect: docs/README explain that it is deferred until the first real form. |

---

# C. UI/UX Audit

**Criticality:** Critical = blocks a core goal or violates a release requirement; High = materially harms discovery/conversion/accessibility; Medium = noticeable quality or consistency issue; Low = polish.

| Problem | Location | Evidence | Impact | Effort | Risk | Priority | Recommendation |
|---|---|---|---|---|---|---|---|
| Home page has only hero + categories; no visible trust, services, popular products or contact path | `src/pages/home/ui/HomePage.tsx:39-45`, `src/widgets/home-categories/ui/HomeCategories.tsx:8-67`, `docs/tz.md:295-308` | Live root showed hero plus category load failure; source composes no product/trust/contact widgets | High conversion loss: users cannot validate supplier credibility or reach a relevant product quickly | Medium | Medium | P1 | Add content-bearing trust/service/contact blocks and an API-driven popular/recommended block when data exists; keep random selection prohibited. |
| Persistent header search from the reference is absent | `src/widgets/header/ui/Header.tsx:171-223`, `src/widgets/catalog-content/ui/CatalogContent.tsx:74-89`, reference `pict/reference/belt_ru_1/code.html:120-145` | Search only appears inside catalog content; reference shows search in top navigation | High: users entering on any page have no immediate product discovery control | Medium | Low | P1 | Add a shared search entry that navigates to `/catalog?search=...`; preserve URL-state as source of truth. |
| Visible catalog filters are inert | `src/pages/catalog/ui/CatalogPage.tsx:75-114` | Price inputs, diameter checkboxes and material select have no state, names, URL updates or API mapping; API already supports `filter[attributeCode]` per `docs/tz.md:785-806` | High: UI promises precision filtering but does not reduce result set; creates false affordance and wasted actions | Medium | Medium | P1 | Either connect controls to `filter[...]` search params and existing API contract, or hide them until functional. Add apply/reset behavior appropriate to query cost. |
| Product cards do not offer direct add-to-cart | `src/entities/product/ui/ProductCard.tsx:46-131` | Card has image/title links and price/status only; no `AddToCartButton` unlike detail page | High: adds an unnecessary product-page step for known products and differs from reference card CTA | Medium | Medium | P1 | Add a typed direct-add action only when a default/unique variant is valid; otherwise use an outcome-oriented link such as “Выбрать вариант”. |
| API error state visually dominates the page | `src/shared/ui/error-state/error-state.module.css:1-45`, live `/catalog` screenshot | Full pale-red surface, red border and large circular exclamation occupy the main region; same shell is used in narrow sidebar and wide content | High: failure becomes the visual focal point instead of recovery task; noisy on data-heavy industrial UI | Small | Low | P1 | Create compact inline/region error variants: left accent + concise message + specific action; reserve full-width alert for page-level failure. |
| Empty state is oversized relative to its content | `src/shared/ui/empty-state/empty-state.module.css:1-45`, live `/cart` and product-not-found screenshots | Dashed container stretches to full content width for three lines and a link | Medium: pushes useful next action below the fold and makes sparse states feel unfinished | Small | Low | P1 | Size to content within a constrained region; use task-specific copy and a primary action. |
| Generic dash/exclamation icons do not explain the state | `src/shared/ui/empty-state/EmptyState.tsx:23-24`, `src/shared/ui/error-state/ErrorState.tsx:27-29` | Same `—` and `!` metaphors appear for empty cart, missing product and API errors | Medium: weakens comprehension and brand specificity | Small | Low | P2 | Use no icon where copy is sufficient, or use contextual cart/product/network iconography with meaningful labels. |
| Error retry label is generic | `src/shared/ui/error-state/ErrorState.tsx:20-21,37-39` | Default action is simply `Повторить` in multiple contexts | Medium: does not say what will be retried, especially in sidebar vs product list | Small | Low | P2 | Pass labels such as `Повторить загрузку категорий` and `Повторить загрузку товаров`. |
| Contact, privacy and terms routes are placeholders | `src/pages/contacts/ui/ContactsPage.tsx:15-20`, `src/shared/ui/placeholder/Placeholder.tsx:7-12` | Live `/contacts` says content will appear in the next stage; reference contains real contact/service footer patterns | High trust and SEO risk; a user who needs a quote has no contact data | Medium/Large | Medium | P1 | Implement approved real content and contact methods before using these routes as conversion support; keep legal copy source-controlled and reviewed. |
| Checkout CTA ends in a Toast instead of a commercial next step | `src/features/checkout-placeholder/ui/CheckoutPlaceholder.tsx:7-29`, `docs/tz.md:363-387` | Button only says checkout is coming; no manager/contact/quote handoff | High but intentional MVP limitation: cart cannot complete a purchase or request | Medium | Medium | P1 | For MVP, make the limitation explicit and offer an approved “Уточнить наличие и цену” contact/quote action; later connect the real order form without dark patterns. |
| Header account icon is a disabled-looking future affordance | `src/widgets/header/ui/Header.tsx:205-207`, `src/widgets/header/ui/header.module.css:90-99` | A non-interactive user icon has a tooltip about a future release | Medium: looks clickable but cannot act; adds uncertainty to navigation | Small | Low | P2 | Remove until account exists, or present it as explicit non-interactive text outside the action group. |
| Footer links misrepresent the available information architecture | `src/widgets/footer/ui/Footer.tsx:20-43` | “О компании” points to `/`; contacts are reused for wholesale/address links; no real about/quote content exists | Medium: weakens trust and makes user intent unclear | Small/Medium | Low | P2 | Map labels to real destinations; add dedicated quote/contact targets only when content exists. |
| Visual identity relies mostly on logo + yellow accent | `src/app/styles/tokens.css:7-45`, `src/pages/home/ui/home-page.module.css:8-53`, diagnosis evidence | Inter + generic cards/states make the shell resemble a template when BELT mark is removed | Medium: lower perceived expertise for an industrial procurement audience | Medium | Medium | P2 | Preserve Inter for data legibility but add structural signatures: denser spec layouts, clearer status/lead-time hierarchy, consistent engineered borders and content-bearing labels. |
| Kicker labels add uppercase noise without decision value | `src/pages/catalog/ui/CatalogPage.tsx:62,76`, `src/pages/catalog/ui/catalog-page.module.css:25-31,40-46` | “КАТЕГОРИИ” and “ФИЛЬТРЫ” are tracked uppercase labels above self-evident sections | Low/Medium: consumes hierarchy and reads like a template marker | Small | Low | P3 | Keep one useful section heading; remove or replace kickers with result/context information. |
| CTA tactile states are incomplete | `src/pages/home/ui/home-page.module.css:39-54`, `src/shared/ui/button/button.module.css:1-93` | Hover exists, but primary links/buttons lack explicit active transform/pressed feedback; error actions are visually generic | Low/Medium: actions feel less responsive, especially on mobile | Small | Low | P3 | Add consistent hover, active, disabled, loading and focus treatment across Button/link-like CTA. |
| Card attributes use very small text | `src/entities/product/ui/product-card.module.css:88-104` | Attribute rows render at `0.6875rem` (~11px), below the reference body-sm/data density | Medium: specs are core decision data and become hard to scan on mobile | Small | Low | P2 | Use the shared body-sm token and reserve code scale for SKU only; test at 320/375px. |
| Footer/current content is stale or generic | `src/widgets/footer/ui/Footer.tsx:15-16`, `pict/reference/belt_ru_3/code.html:268-300` | Current footer says `© 2024`, lacks approved address/phone/email shown in reference direction | Low/Medium: reduces perceived recency and trust | Small | Low | P3 | Replace with approved legal year and verified company/contact data; do not copy reference data without approval. |

## Responsive observations

- The CSS has explicit 320px, 48rem and 64rem behavior, the catalog grid collapses from 4 → 3 → 2 → 1 columns, and cart collapses to one column under 55rem.
- Mobile bottom navigation is useful and reserves `--bottom-nav-inset`, but header control sizing is 40px (`--control-height-sm`), below the 44px touch target recommendation in the project brief.
- The mobile drawer locks body scroll and focuses its close button, but it does not implement a focus trap or restore focus to the burger opener; `aria-controls` is absent.
- Reference pages emphasize a dense desktop 12-column information layout. Current mobile-first shell is more spacious and generic; adapt density per breakpoint rather than copying reference markup.

---

# D. Accessibility Audit

> The automated accessibility audit endpoint failed with `SyntaxError: Unexpected identifier 'Object'`. Findings below are evidence-based manual/static results, not a claim of a successful automated score.

| Issue | Location | Evidence | Impact | WCAG relevance | Effort | Priority |
|---|---|---|---|---|---|---|
| Duplicate `main` landmark and duplicate `main-content` id on service pages | `src/app/layouts/RootLayout.tsx:13`, `src/shared/ui/placeholder/Placeholder.tsx:9`; live `/contacts` | Browser DOM: `mainCount: 2`, ids contain `main-content` twice | High: screen-reader landmark ambiguity and skip-link target ambiguity | 1.3.1, 2.4.1 | Small | P0 |
| Filter labels are not associated with their controls | `src/pages/catalog/ui/CatalogPage.tsx:78-108` | Price/diameter/material labels have no `htmlFor`; price inputs are siblings, not wrapped by label | High: form controls may be announced without a useful accessible name | 1.3.1, 3.3.2 | Small | P1 |
| Mobile drawer focus is not contained or restored | `src/widgets/header/ui/Header.tsx:82-155` | Escape handling and initial close focus exist, but no Tab trap and no opener ref restoration | High for keyboard users: focus can move behind modal drawer and be lost on close | 2.1.1, 2.4.3 | Small/Medium | P1 |
| Mobile drawer button lacks explicit controlled-region relationship | `src/widgets/header/ui/Header.tsx:177-187` | `aria-expanded` exists but no `aria-controls`; dialog wrapper is dynamically rendered | Medium: relationship is less discoverable for assistive tech | 4.1.2 | Small | P2 |
| Hidden mobile navigation links remain in DOM with zero dimensions | `src/widgets/mobile-bottom-nav/ui/MobileBottomNav.tsx:69-92`, `.root` CSS lines 1-8 | SEO live audit flagged hidden `/catalog` and `/contacts` anchors; desktop root hides the entire nav | Low/Medium: duplicate navigation nodes can confuse crawling and automation | 2.4.4, SEO crawlability | Small | P2 |
| Account icon is not an interactive element and has no accessible name | `src/widgets/header/ui/Header.tsx:205-207` | It is a `<span>` with only a `title` | Low: currently not actionable, but visually resembles an account control | 4.1.2 when exposed as control | Small | P2 |

## Accessibility strengths

- Global `:focus-visible` is defined in `src/app/styles/global.css:88-91`.
- Skip link exists in `src/widgets/header/ui/Header.tsx:172-175`.
- `Input` connects label/hint/error and exposes `aria-invalid`/`aria-describedby` in `src/shared/ui/input/Input.tsx:33-62`.
- Dialog keyboard handling and opener restoration are covered in `src/shared/ui/dialog/Dialog.tsx:64-126`.
- Product/gallery/quantity selection includes labelled controls and live status announcements.
- Images in `ProductCard`, `ProductGallery` and `CartContent` include alt fallbacks.

---

# E. SEO Audit

## Automated live evidence

The root SEO audit on `http://127.0.0.1:5174/` scored `0.75` in the available audit service:

- canonical: pass;
- meta description: pass;
- HTTP 200: pass;
- crawlable: pass;
- font legibility: pass with 94% legible text;
- crawlable anchors: failed for two zero-dimension mobile links;
- robots.txt: failed because Vite fallback returned HTML, not robots syntax.

The root audit also found no runtime meta description on the MSW-blocked `5173` page because application bootstrap never mounted. That is a dev failure, not a separate metadata implementation conclusion.

| SEO Issue | Location | Evidence | Impact | Effort | Priority | Recommendation |
|---|---|---|---|---|---|---|
| Public HTML is SPA shell only | `index.html:1-10`, `src/app/main.tsx:20-39`, ADR-0001:14-18 | Initial document contains only `#root`; route content/metadata is created after JS. Project docs explicitly acknowledge this. | Critical: unreliable indexability and slow content discovery for category/product pages | Large | P0 release blocker | Implement the already accepted React Router Framework Mode hybrid: prerender static pages, SSR catalog/category/product, client-only cart. Preserve FSD/API/Zod boundaries. |
| Route HTTP statuses are not production-correct | `src/app/router/routes.ts:91-97`, current Vite fallback | `/does-not-exist` returns 200 HTML; missing entities are client UI 404s after JS | Critical: soft 404s and incorrect monitoring/cache behavior | Large | P0 release blocker | Server route handling must return 404 for unknown routes/entities and 500 for unhandled server failures. Add HTTP contract tests. |
| `/robots.txt` and `/sitemap.xml` are missing | `public/` contains only `mockServiceWorker.js`; verified via live request | Both return `200 text/html` from Vite fallback; SEO audit reports 16 robots syntax errors | Critical: crawler directives and discovery are invalid | Small/Medium | P0 | Generate production-origin `robots.txt` and `sitemap.xml` outside SPA fallback; include only indexable canonical public routes. |
| Structured data is not implemented | No `application/ld+json`/JSON-LD found in `src` or `index.html` | TZ requires Product, Offer when fixed price, BreadcrumbList, Organization and WebSite | High: misses rich-result eligibility and entity understanding | Medium | P1 | Add validated JSON-LD at the route/rendering layer; never fabricate Offer price for `on_request`, and derive Product/Breadcrumb data from the existing models. |
| Product/category metadata is client-generated | `src/shared/lib/page-metadata/MetadataElements.tsx:7-29`, page metadata calls | Descriptor generation is clean, but `<title>`, description, canonical and robots are emitted only after hydration | High: good metadata logic is not enough for crawlers before SSR/prerender | Large | P0 | Reuse `createPageMetadata` through route metadata API/server output; keep one source of metadata truth. |
| Error/loading metadata may temporarily canonicalize to generic paths | `src/pages/product/ui/ProductPage.tsx:22-49`, `src/pages/category/ui/CategoryPage.tsx:21-49` | Loading/not-found/error states use `/product` or `/catalog` canonical fallback before/while entity data is known | Medium: transitional duplicate/canonical signals if rendered to crawlers | Medium | P1 | In SSR route loaders, resolve entity/status before emitting final metadata; noindex error/loading responses and avoid generic canonical on a missing dynamic slug. |
| Contacts/privacy/terms are noindex by default | `src/pages/contacts/ui/ContactsPage.tsx:5-12`, privacy/terms equivalents | Current metadata deliberately uses `indexable: false` | Medium, decision-dependent: contact/service content may be a trust/discovery landing page | Small | P2 | Decide per product policy. Keep legal pages noindex if intended; make verified contact page indexable if organic/local trust matters. |
| Hidden mobile anchors triggered crawlability warning | `src/widgets/mobile-bottom-nav/ui/MobileBottomNav.tsx:69-92` | Root live SEO audit flagged `/catalog` and `/contacts` anchors with zero dimensions | Low/Medium: duplicate hidden navigation signals | Small | P2 | Use one canonical navigation source per breakpoint or ensure hidden nodes are not treated as crawlable duplicate anchors. |
| Favicon is missing | `public/` inventory; live request `/favicon.ico` returned 404 | Browser request failed with 404 | Low: weak browser/brand polish, not a ranking blocker | Small | P3 | Add approved favicon/manifest assets when brand files are available. |
| External font request is not reliable in the audit environment | `src/app/styles/tokens.css:1` | Browser failed Google Fonts request; fallback still rendered | Low/Medium: typography shifts can affect CLS/brand consistency | Small/Medium | P3 | Measure production font loading; consider self-hosting approved font files or preconnect/preload only when allowed by CSP and licensing. |
| Pagination has links but no explicit SEO policy | `src/shared/ui/pagination/Pagination.tsx:16-34`, `CatalogContent.tsx:133-137` | Pages are URL-addressable; no route-level canonical/index policy for sort/search/page combinations is visible | High for crawl budget/duplicates | Medium | P1 | Define indexable category landing URLs; canonicalize or noindex search/filter/sort combinations; ensure pagination policy is deliberate and tested. |

## SEO strengths

- `createPageMetadata` normalizes title/description and constrains canonical origin in `src/shared/lib/page-metadata/pageMetadata.ts:38-135`.
- Product/category models contain SEO fields and canonical paths.
- Cart, errors, service states and dev preview are intentionally marked `noindex, nofollow` in page code.
- Human-readable category paths and product slugs exist.
- Breadcrumb component is semantic and link-based in `src/shared/ui/breadcrumbs/Breadcrumbs.tsx:14-29`.

---

# F. E-Commerce Conversion Audit

| User Flow | Problem | Friction | Impact | Recommendation |
|---|---|---|---|---|
| Landing → Category | Home exposes a strong yellow “Перейти в каталог” CTA but little proof of supplier reliability | User must trust a generic hero claim; no verified contacts, delivery terms, advantages or popular products in current composition | High | Add concise proof blocks: product breadth, availability/lead-time promise, wholesale support, verified contacts and API-driven featured products. |
| Header → Discovery | No global search field | User must first open catalog before searching; reference explicitly uses persistent top-bar search | High | Add header search that routes to catalog URL-state; preserve query on navigation. |
| Catalog → Results | Filter controls do not affect results | Price/diameter/material actions appear functional but are inert | High | Implement query-backed filters using existing `filter[...]` contract; show active filters, result count and reset. |
| Catalog → Product | Product cards are informational only | Known product requires opening detail before add | High | Provide direct add where a safe default variant exists; otherwise show “Выбрать вариант” clearly. |
| Product → Cart | Core variant/quantity/add behavior is well structured | Purchase decision still lacks verified delivery/contact/trust content; detail page has category, SKU, price, availability and terms but not a full service layer | Medium/High | Add verified lead time, delivery/returns/contact details and quote fallback without inventing data. |
| Cart → Checkout | Checkout is only a Toast placeholder | No lead capture, quote request or manager handoff | Critical for commercial release; expected MVP limitation | Keep honest MVP copy but add approved contact/quote action. Build real form with React Hook Form only when requirements/data are approved. |
| Cart recovery | Persisted IDs are re-resolved safely | Missing/changed variants remain until explicit removal, which is correct but may require more guidance | Medium | Keep behavior; improve warning copy and provide “find replacement”/contact action when product is unavailable. |
| Trust pages | Contacts/privacy/terms are placeholders | A hesitant buyer cannot verify company/contact/legal context | High | Prioritize approved contact page and useful footer mapping before conversion experiments. |
| Mobile purchase | Bottom nav improves access, but search is not persistent and 40px header actions are small | More taps and lower touch confidence on narrow screens | Medium/High | Add mobile search entry, raise key touch targets to 44px+, preserve bottom-nav inset and test 320/375px. |
| Error/empty recovery | Generic full-width error/empty shells dominate sparse states | Recovery action is visually disconnected from context | Medium | Use compact region-specific states with outcome-oriented labels and contextual next links. |

## Conversion positives

- Yellow primary CTA is visually clear and aligned with the industrial reference direction.
- Product detail has the essential commercial primitives: variant, SKU, price, unit, availability, min quantity and step.
- Cart quantity rules, stale data resolve and missing variant handling are safer than storing stale prices locally.
- No dark patterns, artificial scarcity or hidden refusal paths were found.

---

# G. Design System Recommendations

Keep the current token location and CSS Module approach. Do not introduce a new component library or rewrite styles.

1. **State variants:** define compact/region/page variants for `ErrorState` and `EmptyState`; keep semantic roles and live regions, but avoid one giant surface for every context.
2. **Form tokens:** add a shared label/control association pattern for filters; remove direct page-level ad hoc inputs or wrap them with the existing `Input`/`NumberInput` where appropriate.
3. **Touch tokens:** raise interactive mobile controls from `2.5rem` to a minimum 44px where they are primary actions; retain compact desktop density only where it does not reduce operability.
4. **Status hierarchy:** keep yellow for primary actions, green/blue/orange for availability states, red only for errors/destructive actions as described in `pict/reference/industrial_standard/DESIGN.md:122-167`.
5. **Typography:** Inter is acceptable for data-heavy UI and is explicitly specified by the project reference. Improve differentiation through weight, spacing, code treatment, and information structure before changing fonts.
6. **Links:** define a semantic link color/focus rule so empty-state links do not fall back to browser-default purple.
7. **Product cards:** standardize title, SKU, primary price, unit, availability/lead-time and action order. Keep SKU in JetBrains Mono and do not reduce core specs below shared body-sm without measurement.
8. **Surface/elevation:** use one primary separator per state; error surfaces should not combine maximum fill, border and oversized icon unless the context is a page-level failure.

---

# H. Architecture Recommendations

## Preserve

- React + TypeScript + Vite.
- Current FSD layer boundaries and public `index.ts` APIs.
- Axios, Zod mappers, TanStack Query and Zustand responsibilities.
- `createPageMetadata` as a pure metadata source.
- Local cart as client-only state for MVP.

## Necessary changes only

1. **Rendering migration:** implement ADR-0001 as a separate architecture task: React Router Framework Mode with prerender for static routes, SSR for catalog/category/product, client-only cart, server 200/404/500.
2. **Metadata integration:** connect the existing descriptor to server route metadata without duplicating SEO logic in page components.
3. **SEO assets:** add production-owned robots/sitemap generation and route policy for canonical/indexable combinations.
4. **Filter feature:** extend existing URL state and API query builder; do not create a parallel state source.
5. **Semantic shell fix:** change `Placeholder` to render a section/div within the layout’s existing main; retain the single `main-content` target in `RootLayout`.
6. **MSW startup resilience:** investigate why the browser environment exposes no usable `serviceWorker.active`; ensure development preview either registers deterministically or fails with a visible diagnostic rather than a blank screen. This is a local/test infrastructure fix, not a production rendering substitute.
7. **No framework rewrite:** Next.js/Nuxt/other framework migration is out of scope and conflicts with the project constraints.

---

# I. Implementation Roadmap

## Phase 0 — Discovery and blocking fixes

| Task | Why | Problem | Expected Result | Files/Components | Dependencies | Impact | Effort | Risk | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Fix single-main/skip-link shell | Restore landmark correctness | Placeholder nests `main` and duplicates id | Exactly one `main` and one skip target per route | `RootLayout`, `Placeholder`, service pages | None | Accessibility/SEO | Small | Low | P0 |
| Fix MSW preview bootstrap | Remove blank local preview | Service Worker registration blocks render | Dev preview visibly renders or reports actionable setup error | `main.tsx`, `mocks/browser.ts`, browser setup | Browser/MSW environment diagnosis | Developer UX/QA | Small/Medium | Medium | P0 |
| Reconcile stale route copy/tests | Restore product/content contract | E2E expects different H1 copy | One approved copy source and green tests | `HomePage`, `CatalogPage`, `tests/e2e/routing.spec.ts` | Copy decision | QA/UX | Small | Low | P1 |
| Complete route/indexing inventory | Prevent hidden SEO assumptions | No robots/sitemap/status implementation | Route matrix approved for 200/404/500/index/noindex/canonical | `routes.ts`, deployment artifacts, docs | Product/SEO decision | SEO | Small | Low | P0 |

## Phase 1 — UI foundation

| Task | Why | Problem | Expected Result | Files/Components | Dependencies | Impact | Effort | Risk | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Define state variants | Reduce generic visual dominance | Error/empty shell reused in incompatible regions | Compact inline, region and page states | `shared/ui/empty-state`, `shared/ui/error-state` | Token review | UI/UX | Medium | Low | P1 |
| Normalize interactive sizing/focus | Improve mobile operability | 40px controls and inconsistent action states | Primary touch targets >=44px and consistent active/focus states | `tokens.css`, Button/IconButton/header/nav CSS | Responsive test matrix | Accessibility | Small | Low | P1 |
| Normalize link/status tokens | Restore palette consistency | Default purple links and mixed state emphasis | All links/statuses use semantic tokens | `global.css`, shared UI CSS | Token inventory | UI/SEO | Small | Low | P2 |

## Phase 2 — Core components and discovery

| Task | Why | Problem | Expected Result | Files/Components | Dependencies | Impact | Effort | Risk | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Add persistent search entry | Reduce search time | Search only exists inside catalog | Header search navigates to URL-state catalog search | `Header`, `ProductSearch`, shared route helper | URL-state contract | Conversion | Medium | Medium | P1 |
| Connect catalog filters | Make promised controls real | Filter UI is inert | Price/diameter/material change URL and API result | `CatalogPage`, `CatalogContent`, filter feature/API query builder | OpenAPI attribute codes | Conversion/SEO | Medium/Large | Medium | P1 |
| Improve ProductCard action hierarchy | Reduce product-to-cart steps | No direct action in list | Safe variant action or clear variant-selection CTA | `ProductCard`, `AddToCartButton` | Variant policy | Conversion | Medium | Medium | P1 |
| Fix mobile drawer focus | Complete keyboard nav | Focus can escape/lost | Trap, `aria-controls`, opener restoration | `Header`, header CSS | None | Accessibility | Small/Medium | Low | P1 |

## Phase 3 — Core e-commerce pages

| Task | Why | Problem | Expected Result | Files/Components | Dependencies | Impact | Effort | Risk | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Add home trust/product blocks | Increase confidence | Home is a thin hero/category entry | Verified benefits, services, contacts and API-driven featured products | `HomePage`, new widgets through public APIs | Approved copy/API data | Conversion | Medium | Medium | P1 |
| Complete contacts page | Provide quote rescue path | Placeholder blocks trust | Verified phone/email/address/wholesale action | `pages/contacts`, footer/header links | Approved business data | Conversion/SEO | Small/Medium | Low | P1 |
| Replace checkout placeholder with approved handoff | Give MVP a useful outcome | Toast ends commercial flow | Contact/quote form or explicit manager handoff | `checkout-placeholder` → approved feature | Backend/form requirements | Conversion | Medium/Large | High | P1 |
| Validate product trust content | Support decision-making | Delivery/manufacturer/returns not consistently visible | Price, unit, stock, lead time, delivery and contact hierarchy | `ProductDetails`, entities/model | API fields/business rules | Conversion | Medium | Medium | P2 |

## Phase 4 — SEO and UX refinement

| Task | Why | Problem | Expected Result | Files/Components | Dependencies | Impact | Effort | Risk | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Implement SSR/prerender migration | Make public storefront indexable | SPA initial HTML and soft statuses | Server-rendered public content with 200/404/500 | `app/router`, route entries, deployment | ADR-0001/runtime choice | SEO | Large | High | P0 |
| Add JSON-LD | Improve entity understanding | No structured data | Valid Product/Offer/Breadcrumb/Organization/WebSite where data supports it | metadata/route layer | SSR/prerender, data policy | SEO | Medium | Medium | P1 |
| Add robots/sitemap | Control crawl/discovery | Both missing | Correct production-origin files | deployment/public generation | Canonical route matrix | SEO | Small/Medium | Medium | P0 |
| Define search/filter/pagination indexing | Avoid duplicate crawl space | URL combinations have no explicit policy | Canonical/noindex policy tested for every combination | route metadata/policy module | SEO decision | SEO | Medium | Medium | P1 |

## Phase 5 — QA and validation

| Task | Why | Problem | Expected Result | Files/Components | Dependencies | Impact | Effort | Risk | Priority |
|---|---|---|---|---|---|---|---|---|---|
| Repair failing Vitest suites | Establish baseline | 4 failures in 3 files during audit | 0 failing tests | `src/mocks/category-page.integration.test.tsx`, `src/shared/ui/button/Button.test.tsx`, `src/shared/ui/input/Input.test.tsx` | Root-cause diagnosis | QA | Small/Medium | Medium | P0 |
| Run browser accessibility validation | Verify semantic fixes | Automated service failed; code-only findings remain | Automated + manual keyboard/screen-reader checks pass | E2E/accessibility test setup | Browser/axe strategy | Accessibility | Medium | Low | P1 |
| Run responsive matrix | Protect 320–1440px UX | Current browser evidence covers shell/error states only | No overflow, one main/one h1, controls usable at 320/375/768/1024/1440 | `tests/e2e/routing.spec.ts` and new cases | Filled API/MSW preview | UX | Medium | Medium | P1 |
| Measure CWV on staging | Validate performance claims | Browser audit showed FCP/LCP variation and external font failures | LCP <=2.5s, INP <=200ms, CLS <=0.1 at 75th percentile | deployment/observability | Real origin/API/assets | Performance | Medium | Medium | P1 |

---

# J. Quick Wins

1. Fix the nested `main` and duplicate `main-content` id.
2. Associate every catalog filter label with its control and either wire the filters or remove the false affordances.
3. Add specific retry labels and compact error/empty variants.
4. Remove or explicitly disable the account stub until the feature exists.
5. Map footer links to real destinations and add an approved contact/quote action.
6. Add `robots.txt`, `sitemap.xml` and favicon to the production artifact/deployment path.
7. Make the MSW dev failure visible and actionable instead of leaving a blank page.
8. Reconcile E2E expected headings with approved current copy.
9. Add an explicit product-card action policy for fixed/default variants.

---

# K. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| SSR migration breaks hydration or cart persistence | Keep cart client-only; add hydration contract tests and preserve existing storage schema/version. |
| Metadata becomes duplicated between page and server route | Keep `createPageMetadata` pure and use one route-level adapter. |
| Filter work diverges from API contract | Derive parameter names from OpenAPI and existing `filter[attributeCode]` format; add query contract tests. |
| Visual redesign removes indexable content/links | Review semantic HTML, H1, breadcrumbs, product text and hrefs in every UI PR. |
| Large error/empty refactor changes tested recovery behavior | Preserve roles/live regions and add component tests before visual variants. |
| Real contact/checkout content is invented | Block implementation until business-approved phone, email, address, delivery and quote rules exist. |
| Font/CWV improvement adds CSP or licensing issues | Measure first; use only approved/self-hosted assets and update deployment CSP deliberately. |
| Over-abstraction creates a second design system | Extend existing shared UI only after at least two real use cases; keep variants small and typed. |

---

# L. Validation Plan

## UI/UX

- Compare home, catalog, category, product, cart and service pages at 320, 375, 768, 1024 and 1440px.
- Check hierarchy: location, product/category context, price, availability, next action.
- Verify error/empty/loading/filled states separately.
- Confirm filter/search/sort/pagination are understandable and URL-shareable.

## Accessibility

- One `main` and one `h1` per route.
- Skip link moves focus to the single `main-content` target.
- All fields have programmatic labels; all dialogs/drawers trap and restore focus.
- Keyboard coverage for header, search, filters, gallery, variants, quantity, cart and checkout.
- Contrast and visible `:focus-visible` at all states; touch targets >=44px for primary mobile controls.

## SEO

- Initial HTML includes route content and metadata for public pages.
- Canonical, description, robots and social metadata are unique and correct.
- `robots.txt`, `sitemap.xml`, structured data and production origin are valid.
- Search/filter/sort/pagination policy has no unintended duplicate URLs.
- Existing, missing and error entities return correct HTTP status codes.

## Performance

- Measure LCP, INP, CLS on staging at the 75th percentile.
- Verify image dimensions, lazy loading, primary image priority, font loading and route chunks.
- Confirm no MSW/fixtures in production output; current verification passed for the audited build.

## Conversion

- Measure search-to-product, product-to-cart, cart-to-contact/quote and error recovery completion.
- Track filter usage, zero-result recovery, direct add-to-cart success and contact CTA usage without collecting unnecessary PII.

---

# M. Definition of Done

- [ ] Existing business logic, API contracts, FSD boundaries and React + TypeScript + Vite stack remain intact.
- [ ] Public storefront rendering strategy from ADR-0001 is implemented or the release remains explicitly blocked.
- [ ] Public routes expose correct HTML, metadata, canonical, robots, structured data and HTTP status behavior.
- [ ] `robots.txt` and `sitemap.xml` are valid for the real production origin.
- [ ] Each route has one `main`, one logical `h1`, working skip navigation and no duplicate ids.
- [ ] Search, filters, sorting, pagination, variant selection, add-to-cart and cart quantity actions are functional and URL/state contracts are tested.
- [ ] Contact/quote/checkout behavior is honest, approved and provides a useful next step.
- [ ] Loading, empty, error, 404 and stale-cart states are contextual, compact and accessible.
- [ ] No critical keyboard, focus, label, contrast or touch-target issues remain.
- [ ] Responsive validation passes at 320, 375, 768, 1024 and 1440px with no horizontal overflow.
- [ ] Lint, typecheck, tests, build, production artifact verification, E2E, SEO and accessibility checks pass.
- [ ] Core Web Vitals meet the project targets or deviations are measured, documented and accepted.

## Bottom line

The current MVP is architecturally disciplined but commercially and publicly incomplete. The right next move is not a rewrite: fix the semantic shell and dev bootstrap, make discovery/filter/action paths real, add approved trust/contact content, then execute the already accepted SSR/prerender migration before public launch.
