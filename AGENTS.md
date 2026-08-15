# AGENTS.md

## Project overview

`e-store-frontend` — frontend B2C-магазина строительных и промышленных материалов. Пользовательский путь: каталог/категория → товар и вариант → локальная корзина. Это текущий MVP: клиентский React/Vite storefront; backend находится вне репозитория и доступен только через HTTP API.

## Tech stack

- React 19 + TypeScript (strict) + Vite 8; React Router 8 browser router с lazy routes.
- TanStack Query — server state и API cache; Zustand `persist` — только клиентская корзина (`localStorage`).
- Axios — единый HTTP client; Zod — проверка DTO/config; MSW — только local development/tests.
- Vanilla CSS: global CSS, CSS custom-property tokens и CSS Modules. Нет Tailwind, CSS-in-JS или component library.
- Vitest + React Testing Library — unit/integration; Playwright — E2E; `@axe-core/playwright` — accessibility E2E.
- SEO: `PageMetadata`, build/dev Vite plugin для `robots.txt` и `sitemap.xml`.
- ESLint strict type-checked rules + Prettier. Требуется Node `>=22.22.0`.

## Architecture

Проект следует FSD-подобным слоям; соблюдайте направленность зависимостей:

`shared → entities → features/widgets → pages → app`.

- `src/app` — bootstrap, providers (React Query), router, layout, global styles/tokens, error boundary и observability.
- `src/pages/<route>` — route-level pages; маршруты перечислены в `src/app/router/routes.ts` и загружаются lazy. `RootLayout` содержит Header, единственный `main#main-content`, Footer и mobile nav.
- `src/widgets` — составные секции страниц (header, footer, catalog/cart content, product details/gallery).
- `src/features` — отдельные пользовательские действия и их model/ui (cart actions, search, filter, sorting, variant selection).
- `src/entities` — домены `product`, `category`, `cart`: DTO/API/query hooks, model/mappers и domain UI.
- `src/shared` — API client/error parsing, config, utilities, model types, metadata и общий UI kit. В `shared` не помещать бизнес-логику.
- `src/mocks` — MSW handlers, scenarios, fixture data и integration tests; не включается в production build.
- `src/shared/ui` — повторно используемые primitives: Button, Input, Dialog, states, Breadcrumbs, Container, Skeleton и т. п.; у каждого модуля публичный `index.ts`.
- `src/app/styles/tokens.css` — tokens; `global.css` — reset, typography, focus и reduced motion. Локальные стили — `*.module.css` рядом с компонентом.
- Unit/component tests обычно colocated как `*.test.ts(x)`; MSW integration tests находятся в `src/mocks`; Playwright specs — `tests/e2e`.
- `openapi/storefront-api.v1.yaml` — API contract. API flow: entity API → DTO validation/mapper → TanStack Query → UI; не обращаться к Axios из UI.

### Imports and module boundaries

- Для межмодульных импортов используйте alias `@/` и публичные `index.ts` модулей. Не импортируйте pages, entities, shared API/config/model/UI или mocks через их внутренние файлы — это проверяет ESLint.
- Внутри модуля допустимы относительные импорты. `shared` зависит только от shared; entities — только от shared; features/widgets — от entities/shared; pages — от features/widgets/entities/shared; mocks не зависят от app/pages.
- `import.meta.env` разрешён только в `src/shared/config/env.ts`; конфигурацию потребляйте через `appConfig`/`shared/config`.

## Code rules

- Сохраняйте строгий TypeScript: без `any`, с type-only imports, без неиспользуемого кода. Следуйте ESLint; не добавляйте inline disables.
- Пишите функциональные React-компоненты и hooks. Компонент экспортирует именованную функцию; prop types/interfaces размещайте рядом. CSS Modules подключайте как `styles`.
- Server state реализуйте через существующие entity query/mutation hooks и query keys; локальное бизнес-состояние — в model/hooks. Не дублируйте server data в Zustand. Не меняйте persisted cart schema/key/version без миграции и теста восстановления.
- Сохраняйте API boundary: Axios использует `shared/api/apiClient`; API responses проходят Zod contracts/mappers и ошибки приводятся к `AppError`.
- Используйте существующий shared UI вместо создания похожего компонента. Перед изменением shared primitive найдите его usages и проверьте все затронутые состояния.
- Для async UI сохраняйте фактический паттерн: loading (`Skeleton`/status), error (`ErrorState` с retry, где уместно), not found/empty (`EmptyState`) и `noindex` metadata для непубличных состояний.
- Соблюдайте имена и расположение: `PascalCase.tsx` для компонентов, `camelCase.ts` для model/API/helpers, `*.module.css`, colocated tests. Не вводите новую параллельную архитектуру или speculative refactoring.

## UI/UX and accessibility

- Используйте токены из `src/app/styles/tokens.css` для цветов, typography, spacing, radius, shadows, container, z-index и control sizes; не вводите произвольные значения без причины.
- Текущая сетка spacing основана на 4px шагах (`--space-1…16`); контейнер — 80rem с gutter; breakpoints: mobile <48rem, tablet ≥48rem, desktop ≥64rem, wide ≥80rem. Сохраняйте bottom inset для mobile nav.
- Сохраняйте responsive layout без горизонтального overflow, особенно на 320, 375, 768, 1024 и 1440px. Primary controls currently use 2.75rem; при изменении touch UI учитывайте audit recommendation стремиться к 44px для основных mobile targets.
- Используйте semantic HTML прежде ARIA: один логический `h1` и один `main#main-content` на каждом route state, настоящие links для navigation и buttons для actions. Не добавляйте ARIA без семантической потребности.
- Не ломайте visible `:focus-visible`, keyboard flow, skip link, reduced-motion behaviour, labels, meaningful image `alt`, dialog focus trapping/restoration и existing live regions. Для status/error используйте уже принятые `role=status`/`role=alert` patterns.
- Цель UI из Kombai guideline: понятный товарный поиск и выбор, прозрачные характеристики/наличие/цена и низкий friction; без dark patterns. Референсы в `pict/` — направление, не источник для буквального копирования.

## SEO rules

- Каждая page state формирует metadata через `createPageMetadata` + `PageMetadata`: title, description, canonical, robots, Open Graph и Twitter. Keep public pages unique; descriptions normalize/truncate in helper.
- Сохраняйте semantic headings, breadcrumb/internal links, descriptive anchors и image alt text. UI redesign не должен убирать H1, meaningful text or navigation links.
- Текущие unconditional indexable static routes: `/` and `/catalog`; sitemap is generated only for them. `robots.txt` disallows `/cart`, `/contacts`, `/privacy`, `/terms`, `/ui-preview` and all query URLs. Do not change this policy implicitly.
- Cart, loading/error/not-found and current service-placeholder routes are `noindex, nofollow`; preserve this unless an approved content/indexing decision changes it.
- `robots.txt` and `sitemap.xml` are generated by Vite in development and build, based on `VITE_PUBLIC_SITE_URL`; verify them after relevant changes.
- This MVP is a client-only SPA: route content/metadata are hydrated client-side and unknown routes cannot return server HTTP 404. ADR-0001 accepts a future SSR/prerender migration while preserving React/Vite/FSD/API boundaries; do not claim it is already implemented or attempt it incidentally. JSON-LD and dynamic category/product sitemap entries are not currently implemented.

## Testing and verification

Run the relevant commands from `package.json` (use `npm`):

```text
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
npm run test:a11y
npm run verify:production-output
```

For a complete change, the expected order is:

```text
typecheck → lint → test → build → e2e → a11y → production-output
```

Also use `npm run format:check` when formatting is relevant; `npm run format` writes files. E2E starts a Vite test server with MSW automatically. `verify:production-output` requires `dist/` from `build` and ensures that MSW/handlers/fixtures did not ship. Add or update colocated unit tests, MSW integration tests, and/or Playwright coverage in proportion to the changed behavior.

## Rules for AI agents

- Read the affected code, public APIs, tests and project docs before editing; base claims on evidence. If docs conflict with code, flag the conflict rather than silently inventing a rule.
- Preserve the current React + TypeScript + Vite stack, FSD boundaries, API contracts and business logic. Do not rewrite the project, backend/API, or change stack without an approved, evidence-backed decision/ADR.
- Do not break the existing Phase 0–3 foundation: semantic shell/bootstrap resilience, tokens/shared primitives, core commerce pages, metadata/SEO assets, and their tests.
- Reuse existing components and module APIs. Do not create duplicate layers, UI primitives, stores, API clients or dependencies without a demonstrated need.
- Before changing a shared component, search its usages and assess visual, accessibility and behavioral impact across routes.
- After changes, run the smallest relevant checks and the full applicable verification sequence before handoff; state anything not run and why.
- Do not use destructive Git commands (`reset --hard`, forced checkout/clean) or discard unrelated working-tree changes. Keep `package-lock.json` aligned if an approved dependency change is made.
