# Рекомендации по исправлению accessibility evaluator-сервиса

**Статус:** независимая рекомендация для владельца browser/audit-сервиса  
**Контекст:** сервис возвращает `SyntaxError: Unexpected identifier 'Object'` внутри `UtilityScript.evaluate`; application repository не является объектом изменений.

## Наблюдаемое поведение

Ошибка воспроизводится на нескольких независимых HTML-маршрутах и возникает до формирования accessibility report:

```text
Accessibility audit failed: SyntaxError: Unexpected identifier 'Object'
    at eval (<anonymous>)
    at UtilityScript.evaluate (<anonymous>:302:30)
```

При этом обычный Playwright `page.evaluate()` на тех же страницах успешно выполняет:

- `typeof Object`;
- `Object.keys(Object)`;
- `new Function('return Object')()`.

Это указывает на проблему в коде, который генерирует или инжектирует evaluator, либо на несовместимость browser adapter/evaluator версий. Сам HTML-продукт не должен считаться причиной до получения точного generated payload.

## Приоритетный план диагностики

### 1. Зафиксировать точный evaluator payload

Перед выполнением записывать:

- версию browser adapter;
- версию Playwright и browser;
- исходный audit options object как JSON;
- финальную строку evaluator, если она генерируется;
- URL и DOM fixture identifier;
- stack с `page.evaluate` boundary.

Не логировать cookies, headers, localStorage, query values или PII.

### 2. Проверить минимальные fixtures

Запустить один и тот же evaluator на:

1. статическом документе `<!doctype html><main><h1>Fixture</h1></main>`;
2. документе с `Object.freeze({})`;
3. документе с React/Vite markup;
4. текущей storefront-странице.

Интерпретация:

- падают fixtures 1–2 — ошибка полностью внутри evaluator/browser adapter;
- проходят 1–2, падают 3–4 — проверить DOM extraction, serialization и route-specific payload;
- падает только 4 — сохранить sanitized DOM snapshot и найти минимальный элемент, после которого появляется ошибка.

### 3. Исключить строковую генерацию JavaScript

Хрупкий паттерн:

```js
const source = `runAudit(document, ${options})`;
await page.evaluate(source);
```

Если `options` — object, результат не является корректным JavaScript source.

Предпочтительный паттерн:

```ts
await page.evaluate(
  ({ options }) => runAudit(document, options),
  { options: auditOptions },
);
```

Если функция передаётся отдельно:

```ts
await page.evaluate(
  ({ serializedOptions }) => {
    const options = JSON.parse(serializedOptions);
    return runAudit(document, options);
  },
  { serializedOptions: JSON.stringify(auditOptions) },
);
```

Не использовать `eval` или `new Function` для передачи данных в page context.

### 4. Проверить shadowing глобального Object

В evaluator wrapper искать:

```js
const Object = ...;
function evaluate(Object) { ... }
```

или некорректно склеенные фрагменты вида:

```js
}Object
```

После устранения генерации source использовать `globalThis.Object` только как диагностический guard, а не как основное исправление.

### 5. Проверить version matrix

Зафиксировать совместимые версии:

- `@playwright/test`;
- `playwright-core`;
- browser binary;
- browser-server RPC package;
- audit/evaluator package;
- Node runtime.

Нельзя диагностировать только по версии браузера: parser error часто создаётся до выполнения DOM-кода в injected utility script.

## Архитектурное исправление evaluator

Рекомендуемая схема:

```text
Node test runner
  -> browser adapter
      -> page.evaluate(function, serializableArgs)
          -> audit engine in page context
              -> structured JSON report
```

Требования:

- evaluator — статическая функция, загруженная обычным module import;
- options передаются через `evaluate` arguments;
- report возвращается как JSON-serializable object;
- DOM extraction отделён от report formatting;
- исключения оборачиваются в typed error с `phase: inject | extract | analyze | serialize`;
- generated source не используется;
- sanitized payload сохраняется только при диагностическом флаге.

## Regression tests для сервиса

Добавить тесты:

```ts
test('evaluates a static fixture', async ({ page }) => {
  await page.setContent('<main><h1>Fixture</h1></main>');
  await expect(runAudit(page)).resolves.toMatchObject({ violations: expect.any(Array) });
});

test('handles Object.freeze in page code', async ({ page }) => {
  await page.setContent('<main><h1>Object.freeze</h1></main>');
  await page.evaluate(() => Object.freeze({ fixture: true }));
  await expect(runAudit(page)).resolves.toBeDefined();
});

test('reports evaluator phase on injected-script failure', async ({ page }) => {
  await expect(runAudit(page)).rejects.toMatchObject({ phase: 'inject' });
});
```

Также добавить smoke test на каждую поддерживаемую комбинацию Playwright/browser-server/browser.

## Acceptance criteria

Исправление считать готовым, когда:

- статический fixture, `Object.freeze` fixture и React fixture проходят;
- ошибка содержит structured phase и не теряет исходный cause;
- evaluator не применяет `eval`, `new Function` или source concatenation;
- options с nested objects, quotes, Unicode и `undefined` корректно передаются;
- report стабилен при пустом DOM и malformed markup;
- несовместимая версия adapter завершается понятной diagnostic error;
- текущий storefront получает полноценный accessibility report, а не generic parser error;
- regression suite запускается в CI с зафиксированными версиями.

## Проектный fallback

До исправления внешнего сервиса проект использует независимый `@axe-core/playwright` suite. Это не исправляет evaluator-сервис и не заменяет ручную проверку клавиатуры/screen reader, но возвращает автоматический accessibility gate в CI.
