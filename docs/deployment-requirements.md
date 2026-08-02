# Provider-neutral deployment requirements

Документ описывает входные требования к будущему hosting/runtime и не выбирает провайдера.
Проект не содержит deployment workflow и этим этапом не публикуется.

## Статус артефакта

Текущая команда `npm run build` создаёт статический SPA в `dist/`. Этот артефакт подходит
для локальной проверки, CI и закрытого preview, но не удовлетворяет требованиям публичного
storefront к серверному HTML и HTTP-статусам.

Публичный production-релиз возможен только после реализации
[ADR-0001](adr/0001-rendering-strategy.md). Итоговый артефакт должен включать:

- server/edge runtime для SSR каталога, категорий и товаров;
- prerendered HTML главной, контактов, политики и соглашения;
- версионированные статические assets;
- клиентскую гидратацию и client-only корзину;
- серверные ответы `200`, `404` и `500`.

Точная структура server bundle и команда запуска фиксируются в миграционной задаче после
выбора совместимого runtime.

## Сборка текущего SPA

- Node.js: `>=22.22.0`; рекомендуемая CI-линия — Node.js 24 LTS.
- Package manager: npm с закоммиченным `package-lock.json`.
- Установка: `npm ci`.
- Сборка: `npm run build`.
- Проверка артефакта: `npm run verify:production-output`.
- Текущий output: каталог `dist/`.

Переменные `VITE_*` подставляются во время сборки. Изменение окружения требует новой
сборки, а не редактирования уже созданного bundle.

## Маршрутизация текущего закрытого preview

Статический hosting текущего SPA должен:

- отдавать существующие assets напрямую;
- переписывать известные клиентские маршруты без расширения на `/index.html`;
- не переписывать `/api/*`, отсутствующие assets и файлы с расширением на HTML;
- сохранять корректный `Content-Type`;
- не кешировать HTML как immutable.

Обычный глобальный fallback любого неизвестного URL на `index.html` возвращает ложный HTTP
`200`. Поэтому он допустим только для закрытого SPA preview и не является решением для
публичного релиза.

## Переменные окружения

| Переменная                 | Staging/production требование                                   |
| -------------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`        | `/api/v1` или абсолютный HTTPS URL без credentials/query/hash   |
| `VITE_PUBLIC_SITE_URL`     | фактический корневой HTTPS origin                               |
| `VITE_APP_ENV`             | `staging` или `production`                                      |
| `VITE_MSW_ENABLED`         | строго `false`                                                  |
| `VITE_ERROR_REPORTING_DSN` | опциональный публичный DSN; сам по себе не включает интеграцию  |
| `VITE_ANALYTICS_ID`        | опциональный публичный идентификатор после privacy-согласования |

Все `VITE_*` значения видны пользователю в JavaScript. Пароли, API tokens, private DSN и
другие секреты в них запрещены.

После SSR-миграции серверному loader понадобится server-only backend origin либо
same-origin proxy. Его значение не должно иметь префикс `VITE_` и не должно сериализоваться
в клиент.

## HTTPS и security headers

Hosting должен поддерживать HTTPS, перенаправление HTTP на HTTPS и настройку заголовков как
для HTML, так и для assets. Минимальная база:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' <IMAGE_CDN_ORIGIN>; connect-src 'self' <API_ORIGIN> <OBSERVABILITY_ORIGIN>; font-src 'self'; form-action 'self'; upgrade-insecure-requests
Referrer-Policy: strict-origin-when-cross-origin
X-Content-Type-Options: nosniff
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

Источники в CSP заменяются точным allowlist выбранного окружения; неиспользуемые источники
удаляются. CSP сначала запускается как `Content-Security-Policy-Report-Only`. Текущий
`Skeleton` использует безопасные React inline style-атрибуты для размеров, поэтому
`style-src` временно требует `'unsafe-inline'`; отказ от этого исключения — отдельное
улучшение. Inline scripts, `eval` и `new Function` не требуются.

`Strict-Transport-Security` включается только после проверки HTTPS на всех нужных
поддоменах; `includeSubDomains` и preload требуют отдельного подтверждения владельца
доменов.

## Кеширование и CDN

- Hashed JS/CSS/assets: `Cache-Control: public, max-age=31536000, immutable`.
- HTML текущего SPA preview: `Cache-Control: no-cache` либо короткий TTL с revalidation.
- Prerendered HTML после миграции: CDN-кеш с обязательной инвалидацией при deployment.
- SSR HTML категорий и товаров: сначала `Cache-Control: no-store`.
- Ответы `404` и `500`: без длительного кеширования.
- Короткий shared cache или `stale-while-revalidate` для SSR разрешается только после
  согласования допустимой давности цен/наличия и механизма инвалидации.

Deployment должен сначала публиковать новые hashed assets, затем HTML/server revision.
Удалять assets предыдущей версии можно только после истечения максимального HTML/CDN-кеша.

## Наблюдаемость

Платформа должна позволять контролировать:

- uptime и TLS;
- долю и частоту HTTP `4xx`/`5xx`;
- latency API и будущего SSR runtime;
- ошибки клиентского ErrorBoundary через сменный adapter;
- Core Web Vitals и размер клиентского bundle;
- успешность deployment и revision, обслуживающую запрос.

Клиентский observability-слой по умолчанию отправляет только allowlist: environment,
error name, source и имена React-компонентов. Сообщение/stack ошибки, полный URL, query,
поиск, корзина и PII не передаются. Подключение внешней системы требует отдельного privacy
review и теста отказоустойчивости.

## Rollback

Платформа должна хранить как минимум предыдущий неизменяемый артефакт и соответствующую
конфигурацию. Rollback выполняется переключением active revision, без пересборки старого
кода. После переключения необходимо:

1. инвалидировать только HTML/server cache, если он указывает на несовместимые assets;
2. проверить главную, каталог, товар, корзину и отсутствующий маршрут;
3. проверить API connectivity, HTTP-статусы и error rate;
4. убедиться, что persisted-корзина безопасно читается или сбрасывается старой версией;
5. зафиксировать причину, revision и время восстановления.

## Что нужно выбрать или предоставить перед deployment

- hosting/runtime с поддержкой итогового React Router SSR и статических assets;
- production и staging domains, TLS и DNS ownership;
- публичный/same-origin API endpoint и server-only backend origin после миграции;
- разрешённые origins изображений, API, аналитики и observability для CSP;
- внешний observability/analytics сервис либо принятое решение не использовать его;
- владельцев алертов, SLO, cache invalidation и rollback;
- политику хранения артефактов и source maps.
