# E-store Frontend

Frontend MVP интернет-магазина строительных материалов после этапа 9: инфраструктура,
базовая дизайн-система, доменные модели, версионированный API-контракт, заменяемый MSW API,
главная, каталог, категории, детальная страница товара, локальная корзина, единые состояния
ошибок, SSR-совместимая модель SEO-метаданных и production-подготовка. Приложение пока
работает как React + Vite SPA и предназначено для локального MVP или закрытого preview.
Публичный production-релиз заблокирован до SSR/prerender-миграции из ADR-0001.

## Требования

- Node.js 22.22 или новее;
- npm.

## Запуск

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Скопируйте `.env.example` в `.env.development.local`.

3. Запустите dev-сервер:

   ```bash
   npm run dev
   ```

4. Откройте адрес, показанный Vite в терминале. Для ручной проверки дизайн-системы перейдите
   на `/ui-preview`, обычно:

   ```text
   http://localhost:5173/ui-preview
   ```

Маршрут `/ui-preview` существует только на dev-сервере, не попадает в production bundle и не
предназначен для индексации.

Для технической production-сборки передайте целевые значения переменных окружения и
обязательно установите `VITE_APP_ENV=staging|production` и `VITE_MSW_ENABLED=false`.
Полученный SPA `dist/` ещё не является артефактом публичного storefront.

## Переменные окружения

| Переменная                 | Назначение                                  | Обязательность |
| -------------------------- | ------------------------------------------- | -------------- |
| `VITE_API_BASE_URL`        | Базовый URL HTTP API                        | обязательна    |
| `VITE_APP_ENV`             | `local`, `test`, `staging` или `production` | обязательна    |
| `VITE_MSW_ENABLED`         | Запуск MSW на dev-сервере                   | обязательна    |
| `VITE_PUBLIC_SITE_URL`     | Публичный origin для canonical и social URL | обязательна    |
| `VITE_ERROR_REPORTING_DSN` | Публичный идентификатор сервиса ошибок      | опциональна    |
| `VITE_ANALYTICS_ID`        | Публичный идентификатор аналитики           | опциональна    |

Все `VITE_*` значения попадают в клиентский bundle и не должны содержать секреты. Исходный
код читает их только через `shared/config`. Некорректная конфигурация останавливает запуск с
понятной ошибкой. MSW доступен только на dev-сервере и полностью исключается из production
bundle. `VITE_PUBLIC_SITE_URL` задаётся абсолютным корневым HTTP(S) URL без path, query,
hash и credentials, например `https://shop.example/`.

Для `staging` и `production` config дополнительно требует HTTPS public URL, HTTPS для
абсолютного API URL и выключенный MSW. Production-сборка не принимает окружения `local` и
`test`. Безопасные шаблоны:

```dotenv
# staging
VITE_API_BASE_URL=/api/v1
VITE_PUBLIC_SITE_URL=https://storefront.staging.invalid
VITE_APP_ENV=staging
VITE_MSW_ENABLED=false
VITE_ERROR_REPORTING_DSN=
VITE_ANALYTICS_ID=
```

```dotenv
# production — замените .invalid фактическим доменом
VITE_API_BASE_URL=/api/v1
VITE_PUBLIC_SITE_URL=https://storefront.production.invalid
VITE_APP_ENV=production
VITE_MSW_ENABLED=false
VITE_ERROR_REPORTING_DSN=
VITE_ANALYTICS_ID=
```

`VITE_ERROR_REPORTING_DSN` зарезервирован для будущего публичного адаптера и сейчас сам по
себе не отправляет события. Подключение сервиса требует privacy review.

## Команды

| Команда                            | Назначение                                    |
| ---------------------------------- | --------------------------------------------- |
| `npm run dev`                      | Запустить Vite dev-сервер                     |
| `npm run lint`                     | Проверить ESLint и границы импортов           |
| `npm run typecheck`                | Проверить TypeScript                          |
| `npm run test`                     | Выполнить unit, component и integration tests |
| `npm run test:watch`               | Запустить Vitest в watch-режиме               |
| `npm run test:e2e`                 | Выполнить Playwright smoke-тесты              |
| `npm run build`                    | Проверить типы и собрать production bundle    |
| `npm run verify:production-output` | Проверить отсутствие MSW/fixtures в `dist/`   |
| `npm run format`                   | Отформатировать проект                        |
| `npm run format:check`             | Проверить форматирование                      |

Перед первым локальным E2E-запуском может потребоваться:

```bash
npm exec -- playwright install chromium
```

## Структура

```text
src/
├── app/       # запуск, провайдеры, ErrorBoundary, observability, роутер и стили
├── entities/
│   ├── category/ # модель Category, Zod-схема и безопасный mapper
│   ├── product/  # модели, API, цена, наличие и характеристики товара
│   └── cart/     # persisted-модель корзины и точная десятичная арифметика
├── features/  # выбор варианта, добавление, resolve и действия с корзиной
├── mocks/     # dev-only MSW worker, handlers и детерминированные fixtures
├── pages/     # route entries главной, каталога, категории, товара, корзины и служебных страниц
├── shared/
│   ├── api/   # общий Axios client и безопасный mapper ошибок
│   ├── config/ # единая runtime-валидация VITE_* переменных
│   ├── lib/   # утилиты, SEO-метаданные, observability adapter и тестовая инфраструктура
│   ├── model/ # общие value objects Money, Image и SeoData
│   └── ui/    # базовые переиспользуемые UI-компоненты
└── widgets/   # композиционные блоки товара, каталога и корзины

openapi/
└── storefront-api.v1.yaml # источник истины для /api/v1

docs/
├── adr/                       # принятые архитектурные решения
├── deployment-requirements.md # provider-neutral требования к размещению
└── release-checklist.md       # go/no-go и rollback checklist
```

Межмодульные импорты используют алиас `@/` и публичные `index.ts`. ESLint контролирует
направление зависимостей FSD, запрет глубоких импортов и доступ к `import.meta.env`.

## Дизайн-система

Глобальные токены находятся в `src/app/styles/tokens.css` и включают палитру из ТЗ,
типографику, отступы, радиусы, тени, ширины контейнеров, брейкпоинты, focus, disabled и
error-состояния. Компоненты используют локальные CSS Modules.

Публичный API `@/shared/ui` экспортирует:

- `Container`;
- `Button`;
- `IconButton`;
- `Input`;
- `NumberInput`;
- `Card`;
- `Badge`;
- `Dialog`;
- `Toast`;
- `Skeleton`;
- `EmptyState`;
- `ErrorState`;
- `ImagePlaceholder`;
- технический `Placeholder` этапа 1.

Пример импорта:

```tsx
import { Button, Input } from '@/shared/ui';
```

Интерактивные компоненты используют семантический HTML и видимый `:focus-visible`. Поля
связывают label, hint и error через ARIA. Toast имеет live region. Dialog закрывается по
Escape, удерживает Tab-фокус внутри и возвращает его на открывший элемент.

## Доменные модели

Публичные API `@/shared/model`, `@/entities/category` и `@/entities/product` экспортируют:

- `Money`, `Image`, `SeoData` и их Zod-схемы;
- `Category` и минимальный `CategoryReference` (`id`, `name`, `path`);
- `ProductListItem`, `ProductDetails` и `ProductVariant`;
- `Availability`, `ProductUnit`, `Attribute`, `VariantOptionGroup` и
  `VariantOptionValue`;
- union-типы цены, наличия, статуса товара и единиц измерения;
- безопасные mapper-функции для категорий, товаров и вариантов;
- `formatMoney` и `formatProductPrice`.

TypeScript-типы выводятся непосредственно из Zod-схем через `z.infer`, поэтому runtime- и
compile-time контракты имеют один источник истины. API-функции получают ответы как
`unknown`, валидируют их Zod-схемой и только затем возвращают mapper-результат приложению.
Mapper-функции не выполняют HTTP-запросы и не зависят от MSW.

## API-контракт и API-слой

Версионированный OpenAPI-контракт находится в
`openapi/storefront-api.v1.yaml`.

| Метод  | Endpoint                                    | Назначение                         |
| ------ | ------------------------------------------- | ---------------------------------- |
| `GET`  | `/api/v1/catalog/categories`                | список категорий                   |
| `GET`  | `/api/v1/catalog/categories/{categoryPath}` | одна категория по полному пути     |
| `GET`  | `/api/v1/catalog/products`                  | фильтруемый постраничный список    |
| `GET`  | `/api/v1/catalog/products/{slug}`           | полные данные одного товара        |
| `POST` | `/api/v1/catalog/variants/resolve`          | актуализация вариантов для корзины |

Публичные API сущностей предоставляют:

- `getCategories`, `getCategory`, `useCategoriesQuery`, `useCategoryQuery`;
- `getProducts`, `getProduct`, `useProductsQuery`, `useProductQuery`;
- `resolveProductVariants`, `useResolveProductVariantsMutation`;
- `categoryQueryKeys` и `productQueryKeys`;
- схемы DTO списка, пагинации, resolve-запроса, resolve-ответа и единой ошибки.

Категории имеют `staleTime` 10 минут и `gcTime` 30 минут; товары — 1 и 5 минут
соответственно. Ошибки `400`, `404`, `409` и `422` не повторяются автоматически. Для
retryable сетевых и серверных ошибок выполняется не более двух повторов. Все ошибки проходят
через общий безопасный `mapApiError`.

## MSW и fixtures

MSW включается только на локальном dev-сервере:

```dotenv
VITE_APP_ENV=local
VITE_MSW_ENABLED=true
VITE_API_BASE_URL=/api/v1
VITE_PUBLIC_SITE_URL=http://localhost:5173
```

Данные находятся в `src/mocks/data`, а handlers — в `src/mocks/handlers.ts`. Fixtures
содержат полное начальное дерево категорий, 20 активных товаров и одну отдельную архивную
запись. Они детерминированы, не импортируются в UI и проходят те же Zod-схемы, что и ответы
будущего backend. Для ручной проверки галереи MSW также отдаёт нейтральные
SVG-изображения по fixture-URL; в production output эти mock-ресурсы не входят.

Локальные негативные сценарии выбираются служебным заголовком
`x-msw-scenario`: `delay`, `empty`, `server-error`, `network-error`,
`invalid-response`, `conflict`, `changed-price` или `changed-availability`. Без заголовка
используется успешный сценарий. Некорректные query-параметры и неизвестные slug естественно
возвращают `400` и `404`.

Для перехода на Go API достаточно установить реальный `VITE_API_BASE_URL` и
`VITE_MSW_ENABLED=false`. UI продолжит использовать те же entity hooks и доменные модели:
Axios, форма DTO, Zod и источник ответа остаются скрыты внутри API-сегментов.

## Контрактные решения и допущения

- `CategoryReference` зафиксирован как строгий объект с `id`, `name` и `path`. `path`
  содержит готовый клиентский URL категории, например `/catalog/truby/pnd`; лишние поля
  отклоняются Zod-схемой.
- `CartResolvedVariant` содержит актуальный вариант и минимальную ссылку на товар: `id`,
  `slug`, `name` и изображение. Этого достаточно для безопасного восстановления корзины без
  дополнительных запросов.
- URL категорий использует полный путь, например `/catalog/truby/pnd`; API получает путь без
  префикса `/catalog`.
- Список категорий возвращается как плоский `Category[]`; дерево восстанавливается по
  `parentId`, а фильтр родительской категории включает её потомков.
- Пагинация MSW по умолчанию использует `page=1` и `limit=20`.
- Неизвестная категория и некорректные `page`, `limit` или `sort` возвращают `400`;
  attribute-фильтры используют точное сравнение строкового представления значения.
- Архивность — fixture-only metadata; storefront DTO по ТЗ допускает только
  `status: active`, поэтому архивная запись никогда не возвращается API.

Эти пункты необходимо подтвердить перед реализацией Go API; изменение публичной формы DTO
потребует обновить OpenAPI и связанные contract-тесты.

## Страница товара

Маршрут `/product/:productSlug` загружает данные только через `useProductQuery` и
показывает Skeleton, отдельный экран 404 либо безопасный ErrorState с повтором запроса.
Успешное состояние включает хлебные крошки, галерею, один `h1`, цену и старую цену,
артикул, текстовое наличие, единицу измерения, минимальное количество, шаг заказа,
характеристики, описание и ссылку обратно в категорию.

Выбор варианта находится в `@/features/select-product-variant`, использует локальное
состояние и автоматически выбирает первый вариант не со статусом `out_of_stock`.
Несуществующие комбинации отключаются. Radio-группы поддерживают мышь, Tab, стрелки,
`Home` и `End`; смена варианта обновляет SKU, цену, наличие, единицу, изображение и
характеристики. Цена «по запросу» выводится без фиктивной суммы, а `on_order` — как
текстовое состояние «Под заказ».

## Корзина

Выбранный вариант добавляется со страницы товара через `@/features/add-to-cart`. В Header
показывается число отдельных позиций, а маршрут `/cart` отображает актуальные название,
изображение, SKU, параметры, цену, наличие и единицу измерения. Количество можно изменять
кнопками, клавиатурой или полем ввода с учётом `minOrderQuantity`, `quantityStep` и
`maxOrderQuantity`. Для очистки всей корзины требуется подтверждение.

Zustand-хранилище `@/entities/cart` сохраняет под ключом `storefront-cart-v1` только:

```ts
{
  variantId: string;
  quantity: string;
  addedAt: string;
}
```

Обёртка Zustand имеет версию `1` и отдельную точку миграции. Данные проходят строгую
Zod-валидацию при восстановлении; повреждённые и неизвестные версии безопасно сбрасываются.
Доступ к `localStorage` и гидратация выполняются только после монтирования приложения.
Товарные данные, цены, наличие и суммы в браузерное хранилище не записываются.

После гидратации `@/features/resolve-cart` передаёт сохранённые идентификаторы существующему
`useResolveProductVariantsMutation`. UI получает текущие серверные данные из TanStack Query,
а в Zustand остаётся только локальное состояние корзины. Исчезнувшие или недоступные
варианты остаются видимыми до явного удаления; ошибка resolve не очищает корзину и допускает
повтор запроса.

Десятичные количества нормализуются без арифметики с плавающей точкой. Стоимость строки
округляется до копейки, после чего итог складывается через `bigint`. В предварительный итог
входят только доступные варианты с фиксированной ценой; позиции с ценой «от», «по запросу»,
некорректными правилами количества или отсутствующие в актуальном ответе показываются
отдельно и не создают фиктивную стоимость.

## Качество, доступность и SEO-подготовка

Загрузка списков, товара, категории и корзины сопровождается Skeleton. Пустые результаты,
пустая корзина и 404 имеют отдельные EmptyState, а сетевые и непредвиденные ошибки —
безопасный ErrorState или глобальный ErrorBoundary с повтором запроса и понятной навигацией.
Технические детали Axios, Zod, MSW и stack trace пользователю не показываются.

Глобальный ErrorBoundary передаёт непредвиденные ошибки в единый observability-слой, не
меняя recovery UI. Локально используется `console.error` только с очищенным allowlist;
в `test`, `staging` и `production` адаптер по умолчанию no-op до выбора внешнего сервиса.
Сообщение и stack ошибки, URL/query, поисковый запрос, корзина и PII не передаются.

Основные страницы имеют один `main` и один `h1`, skip-link к содержимому и видимый
`:focus-visible`. Галерея, варианты, поиск, сортировка, QuantityControl и диалог управляются
клавиатурой. Добавление в корзину, смена варианта и количества, результат каталога, ошибки и
актуализация корзины объявляются через осмысленные live regions. Изображения имеют
альтернативный текст или доступную заглушку. Адаптивность и отсутствие горизонтального
переполнения проверяются в Playwright на 320, 375, 768, 1024 и 1440 px.

Чистая функция `createPageMetadata` в `@/shared/lib` формирует `title`, `description`,
canonical URL, robots, Open Graph и базовые Twitter Card-данные. Она не зависит от DOM и
принимает публичный URL из валидированного config-модуля. Компонент `PageMetadata` отвечает
только за применение готового descriptor через поддерживаемые React metadata elements;
поэтому формирование можно повторно использовать при будущем SSR/prerendering.

- главная и каталог используют постоянные индексируемые метаданные;
- категории используют `Category.seo`;
- товары используют `ProductDetails.seo` и основное изображение;
- корзина, 404, ошибки, служебные страницы и dev-only UI Preview получают
  `noindex, nofollow`.

## Production-подготовка

GitHub Actions использует `npm ci` и npm cache, затем выполняет format check, lint,
typecheck, unit/component/integration tests, production build, проверку артефакта и
Playwright E2E. Скрипт `verify:production-output` рекурсивно проверяет `dist/` и завершает CI
ошибкой при наличии MSW worker, mock handlers или fixtures.

Эксплуатационные документы:

- [ADR-0001: гибридная стратегия рендеринга](docs/adr/0001-rendering-strategy.md);
- [provider-neutral deployment requirements](docs/deployment-requirements.md);
- [release checklist](docs/release-checklist.md).

Провайдер не выбран, deployment workflow не создавался, сайт не публиковался.

## Реализовано и границы этапов 1–9

Реализованы инфраструктура, маршруты, провайдеры, общий API client, тестовые инструменты,
CI, строгая конфигурация, безопасная наблюдаемость, дизайн-токены, базовый UI Kit,
валидируемые доменные модели, OpenAPI, API-сегменты,
Query hooks, fixtures, MSW handlers, главная страница, каталог, категории, поиск, сортировка,
пагинация, карточки товаров, детальная страница товара, локальная корзина, унифицированные
состояния качества и управляемые метаданные. Намеренно отсутствуют:

- серверная корзина и синхронизация между устройствами;
- настоящий checkout и расчёт заказа;
- оформление заказа, авторизация, оплата и доставка.

Кнопка перехода к оформлению пока показывает нейтральное уведомление и не создаёт заказ.
React Hook Form не установлен: он появится вместе с первой настоящей формой.

## Рендеринг

MVP использует SPA. Модули не обращаются к `window`, `document` или `localStorage` при
импорте; browser-only инициализация и восстановление корзины выполняются в эффектах либо
обработчиках событий. Переход storefront на React Router Framework Mode с SSR и prerendering
выполняется отдельной миграционной задачей перед публичным production-релизом. Целевое
решение уже принято в
[ADR-0001](docs/adr/0001-rendering-strategy.md).

На SPA-этапе метаданные становятся актуальными только после запуска JavaScript, а HTTP-ответ
dev-сервера не может выразить маршрутные `404` и `500`. После этапа 9 остаются SSR
динамических страниц, prerendering статических страниц, корректные HTTP-статусы, production
`robots.txt`/`sitemap.xml` и при необходимости Schema.org. Эти возможности сознательно
вынесены из production-подготовки в миграцию и остаются блокером публичного релиза.
