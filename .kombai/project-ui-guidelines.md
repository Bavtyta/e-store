# UI/UX, SEO & Conversion Audit — E-Commerce Стройматериалы

## 0. Project Context

Ты работаешь над существующим frontend интернет-магазина стройматериалов.

### Product

* Тип: B2C E-commerce
* Тематика: стройматериалы и сопутствующие товары
* Основная задача: помочь пользователю быстро найти подходящий товар, понять его характеристики и совершить покупку.

### Tech Stack

* React
* TypeScript
* Vite

**Стек менять запрещено.**

Не предлагай миграцию на Next.js, Nuxt, другой framework или другой frontend stack.

Backend и API уже существуют и находятся вне scope данной задачи.

### Business Goals

Основные цели редизайна:

1. Повысить конверсию в покупку.
2. Сделать поиск и выбор товаров максимально понятным.
3. Снизить количество лишних действий на пути к покупке.
4. Улучшить визуальное восприятие и доверие к магазину.
5. Улучшить SEO и органическую видимость.
6. Улучшить mobile/responsive UX.
7. Сохранить хорошую производительность.

### Scope

Необходимо провести **аудит существующего frontend на основе фактического кода, структуры проекта, документации и предоставленных UI-референсов**, после чего подготовить поэтапный план улучшения интерфейса.

**На данном этапе код НЕ писать и НЕ изменять.**

Сначала:

**изучение → аудит → выявление проблем → приоритизация → архитектурный план → roadmap → критерии готовности.**

К реализации переходить только после завершения анализа и согласования плана.

---

# 1. Existing Project Analysis

Перед любыми рекомендациями сначала изучи существующий проект.

Проанализируй:

* структуру репозитория;
* `docs/`;
* package.json;
* используемые библиотеки;
* routing;
* state management;
* API integration;
* layout;
* страницы;
* UI-компоненты;
* стили;
* design tokens;
* typography;
* assets;
* изображения;
* формы;
* таблицы;
* карточки товаров;
* модальные окна;
* dropdown/select;
* notifications;
* loading states;
* error states;
* empty states;
* responsive logic.

Определи:

* какие компоненты являются переиспользуемыми;
* какие компоненты дублируются;
* какие части уже хорошо реализованы;
* какие части требуют минимальной доработки;
* какие части требуют существенного изменения.

**Не предлагай переписывать хорошо работающий код только ради использования другой архитектуры или паттерна.**

---

# 2. Documentation & Architecture Compliance

Обязательно изучи документацию в `docs/` и используй её как источник архитектурных ограничений.

Перед рекомендациями по архитектуре определи:

* какие архитектурные решения уже приняты;
* какие соглашения проекта необходимо сохранить;
* какие слои нельзя нарушать;
* какие зависимости между модулями уже существуют;
* какие API-контракты необходимо сохранить.

Если документация и фактический код расходятся, **зафиксируй это отдельно**, а не делай молчаливое предположение.

---

# 3. Reference Analysis

В проекте предоставлены UI-референсы:

`pict/reference`

Проанализируй их как **визуальное и UX-направление**, а не как повод буквально копировать дизайн.

Определи:

* визуальную иерархию;
* layout;
* spacing;
* typography;
* цветовую систему;
* карточки;
* кнопки;
* формы;
* navigation;
* product presentation;
* mobile behaviour;
* визуальные паттерны;
* способы выделения CTA.

Затем определи, какие решения из референсов можно безопасно адаптировать к существующему проекту.

**Не копируй референс механически.**

Приоритет:

1. требования проекта;
2. существующая архитектура;
3. UX;
4. SEO;
5. performance;
6. визуальное соответствие референсам.

---

# 4. UI/UX Audit

Проведи аудит существующего интерфейса.

## 4.1 Visual Hierarchy

Проверь:

* заголовки;
* typography;
* размеры текста;
* font weights;
* spacing;
* contrast;
* grouping;
* визуальные приоритеты;
* CTA;
* product presentation.

Определи, понимает ли пользователь за несколько секунд:

* где он находится;
* что продаётся;
* что можно сделать;
* какое действие является основным.

---

## 4.2 Consistency

Найди визуальные несоответствия:

* разные варианты одинаковых компонентов;
* разные button styles;
* разные input styles;
* разные border-radius;
* разные spacing;
* разные цвета одного назначения;
* разные состояния компонентов;
* дублирование UI-компонентов.

Предложи минимальную унификацию.

---

## 4.3 Navigation

Проверь:

* header;
* navigation;
* breadcrumbs;
* category navigation;
* mobile navigation;
* поиск;
* переходы между категориями;
* переходы из категории в товар;
* переходы из товара в корзину.

Определи, где пользователь может потеряться.

---

## 4.4 Product Discovery

Особое внимание удели поиску товаров.

Проверь:

* search;
* filters;
* sorting;
* categories;
* pagination;
* product cards;
* comparison, если существует;
* favorites, если существует.

Определи, насколько быстро пользователь может перейти:

**запрос → подходящие товары → подходящий товар → покупка.**

---

## 4.5 Product Page

Проверь:

* название;
* цену;
* наличие;
* характеристики;
* описание;
* изображения;
* CTA;
* количество товара;
* доставку;
* related products;
* breadcrumbs;
* trust signals.

Главный вопрос:

**Может ли пользователь принять решение о покупке, не испытывая лишнего friction?**

---

## 4.6 Cart & Checkout

Проверь:

* добавление товара;
* корзину;
* изменение количества;
* удаление;
* стоимость;
* доставку;
* оформление заказа;
* ошибки;
* loading;
* подтверждение действия.

Определи лишние шаги и потенциальные точки выхода пользователя.

---

# 5. E-Commerce Conversion Audit

Проанализируй основной пользовательский путь:

**Landing → Category → Search/Filter → Product → Cart → Checkout → Order**

Для каждого этапа оцени:

* friction;
* количество действий;
* понятность следующего шага;
* visibility CTA;
* доверие;
* наличие необходимой информации;
* потенциальные причины отказа.

Особое внимание:

* цена;
* наличие;
* доставка;
* характеристики;
* CTA;
* отзывы, если существуют;
* гарантии/условия;
* контакты;
* trust signals.

### Важно

Не используй dark patterns.

Не предлагай:

* искусственный дефицит;
* агрессивные pop-up;
* манипулятивные CTA;
* скрытые условия;
* намеренное усложнение отказа.

Цель — увеличить конверсию через:

**понятность + доверие + удобство + снижение friction.**

---

# 6. Responsive & Mobile UX

Проведи аудит:

* desktop;
* tablet;
* mobile.

Проверь:

* layout;
* navigation;
* product cards;
* filters;
* search;
* forms;
* buttons;
* touch targets;
* typography;
* spacing;
* horizontal overflow;
* sticky elements;
* mobile checkout.

Определи, какие компоненты требуют отдельной mobile-логики, а какие можно сделать responsive без дублирования компонентов.

---

# 7. Accessibility

Проверь:

* semantic HTML;
* heading hierarchy;
* contrast;
* keyboard navigation;
* focus states;
* labels;
* form accessibility;
* interactive elements;
* touch target sizes;
* screen-reader semantics;
* aria attributes там, где они действительно необходимы.

Не добавляй ARIA атрибуты без необходимости.

Приоритет — правильная семантика HTML.

---

# 8. Performance

Проанализируй потенциальное влияние UI на производительность.

Проверь:

* bundle size;
* unnecessary dependencies;
* code splitting;
* lazy loading;
* image optimization;
* image dimensions;
* font loading;
* unnecessary re-renders;
* expensive components;
* large lists;
* layout shifts.

Особое внимание:

* LCP;
* INP;
* CLS.

**Не предлагай оптимизацию без конкретной проблемы или потенциального выигрыша.**

---

# 9. SEO Audit

SEO является одним из ключевых требований проекта.

Проведи отдельный технический и e-commerce SEO-аудит.

## 9.1 Technical SEO

Проверь:

* `<title>`;
* meta description;
* canonical;
* robots directives;
* robots.txt;
* sitemap;
* HTTP status handling;
* 404;
* URL structure;
* semantic HTML;
* heading hierarchy;
* internal linking;
* breadcrumbs.

---

## 9.2 Rendering & Indexability

Так как frontend использует:

**React + TypeScript + Vite**

проанализируй, как поисковые роботы получают контент.

Проверь:

* initial HTML;
* JavaScript-dependent content;
* rendering;
* indexability;
* product content;
* category content;
* metadata.

Определи реальные SEO-ограничения текущей архитектуры.

**Не предлагай Next.js или смену framework.**

Если обнаружено архитектурное SEO-ограничение, предложи варианты решения, совместимые с существующим:

**React + TypeScript + Vite + существующий backend/API.**

Для каждого варианта укажи:

* SEO impact;
* complexity;
* architectural impact;
* risks;
* затрагиваемые части проекта.

---

# 10. E-Commerce SEO

Отдельно проверь SEO для:

* homepage;
* categories;
* subcategories;
* product pages;
* brands/manufacturers, если существуют;
* search pages;
* filter pages;
* sorting pages;
* pagination.

Определи:

* какие страницы должны индексироваться;
* какие страницы не должны индексироваться;
* какие URL могут создавать дубли;
* как должны работать canonical;
* как должна работать internal linking.

---

# 11. Structured Data

Проверь необходимость Schema.org / JSON-LD.

Рассмотри:

* Product;
* Offer;
* BreadcrumbList;
* Organization;
* WebSite.

Для каждого типа укажи:

* нужен ли он;
* где применять;
* какие данные необходимы;
* какие риски существуют.

Не добавляй structured data формально.

---

# 12. SEO-safe UI Redesign

Все UI-изменения должны сохранять или улучшать SEO.

Не допускай:

* удаления semantic HTML;
* потери H1;
* неправильной heading hierarchy;
* превращения ссылок в div/button без причины;
* удаления важного текстового контента;
* ухудшения internal linking;
* появления SEO-дублей;
* ухудшения indexability;
* ухудшения Core Web Vitals.

Особенно внимательно относись к:

* category pages;
* product pages;
* breadcrumbs;
* filters;
* pagination;
* internal links.

---

# 13. Design System

Определи, насколько текущему проекту необходима унификация design system.

Проанализируй:

* colors;
* typography;
* spacing;
* radius;
* shadows;
* buttons;
* inputs;
* cards;
* badges;
* tables;
* modals;
* dropdowns;
* notifications;
* states.

Если design system отсутствует или фрагментирована, предложи **минимальную систему**, достаточную для консистентного интерфейса.

Не создавай чрезмерную абстракцию.

Не создавай design system ради самой design system.

---

# 14. Architecture Constraints

Архитектуру проекта необходимо сохранить.

### Запрещено без объективной необходимости:

* менять React;
* менять TypeScript;
* менять Vite;
* переходить на Next.js;
* переписывать backend;
* менять API;
* менять бизнес-логику;
* делать масштабный rewrite.

Если архитектурное изменение действительно необходимо, сначала укажи:

1. проблему;
2. доказательство существования проблемы;
3. почему текущая архитектура не справляется;
4. минимально инвазивное решение;
5. какие файлы/модули будут затронуты;
6. риски.

---

# 15. Evidence-Based Recommendations

**Не выдумывай проблемы.**

Каждая существенная рекомендация должна основываться хотя бы на одном из:

* фактическом коде;
* структуре проекта;
* документации;
* предоставленном UI;
* предоставленных референсах;
* конкретном UX-паттерне.

Если что-то невозможно проверить, явно пометь это как:

**Assumption / Requires verification**

Не утверждай наличие проблемы, если она не подтверждена анализом.

---

# 16. Prioritization

Каждую проблему оцени по:

### Impact

* Critical
* High
* Medium
* Low

### Effort

* Small
* Medium
* Large

### Risk

* Low
* Medium
* High

Отдельно выдели:

### Quick Wins

Изменения с:

**High Impact + Low/Medium Effort + Low Risk**

---

# 17. Implementation Roadmap

Составь последовательный план внедрения.

## Phase 0 — Discovery

* анализ проекта;
* аудит;
* фиксация проблем;
* приоритизация;
* определение scope.

## Phase 1 — UI Foundation

* typography;
* colors;
* spacing;
* layout;
* responsive foundation;
* design tokens.

## Phase 2 — Core Components

* buttons;
* inputs;
* cards;
* navigation;
* dropdowns;
* modals;
* badges;
* tables;
* common states.

## Phase 3 — Core E-Commerce Pages

Приоритет:

1. Homepage
2. Category
3. Search
4. Product Page
5. Cart
6. Checkout
7. Account

Порядок можно изменить, если аудит покажет другую оптимальную последовательность.

## Phase 4 — SEO & UX Refinement

* metadata;
* semantic HTML;
* structured data;
* breadcrumbs;
* internal linking;
* loading states;
* empty states;
* error states;
* accessibility;
* responsive refinement.

## Phase 5 — QA & Validation

* visual regression;
* responsive testing;
* accessibility;
* SEO;
* performance;
* conversion flows;
* regression testing.

---

# 18. Task-Level Roadmap

Для каждой задачи roadmap укажи:

* Task;
* Why;
* Problem;
* Expected Result;
* Files/Components;
* Dependencies;
* Impact;
* Effort;
* Risk;
* Priority.

Не ограничивайся общими формулировками вроде:

> "Улучшить карточку товара."

Нужно писать конкретно:

> "Унифицировать ProductCard, вынести повторяющийся price/availability presentation в существующий компонент X, изменить визуальную иерархию CTA и сохранить текущий API props."

Если конкретный компонент или файл невозможно определить без дополнительного анализа, укажи это явно.

---

# 19. Risks

Определи потенциальные риски:

* regression;
* breaking API assumptions;
* изменение routing;
* SEO regression;
* performance regression;
* responsive regression;
* accessibility regression;
* изменение бизнес-логики;
* excessive abstraction;
* overengineering.

Для каждого риска предложи способ предотвращения.

---

# 20. Validation

Определи, как проверить результат.

### UI

* visual consistency;
* spacing;
* typography;
* components;
* responsive.

### UX

* navigation;
* product discovery;
* search;
* filters;
* checkout.

### SEO

* indexability;
* metadata;
* canonical;
* headings;
* semantic HTML;
* structured data;
* internal linking.

### Performance

* LCP;
* INP;
* CLS;
* bundle;
* images.

### Accessibility

* keyboard;
* focus;
* contrast;
* semantic HTML;
* forms.

---

# 21. Definition of Done

Для каждой Phase определи конкретные критерии готовности.

Общие критерии:

* существующая бизнес-логика сохранена;
* API-контракты сохранены;
* архитектура проекта не нарушена;
* React + TypeScript + Vite сохранены;
* SEO не ухудшено;
* основные коммерческие страницы indexable;
* responsive работает;
* accessibility не имеет критических проблем;
* performance не ухудшилась без объективной причины;
* основные пользовательские сценарии работают;
* отсутствуют критические visual regressions.

---

# 22. Final Output

В финальном ответе используй следующую структуру:

## A. Executive Summary

Краткий вывод:

* главные проблемы;
* главные возможности;
* основные риски;
* рекомендуемая стратегия.

## B. Current Architecture

Фактическое описание существующего frontend.

## C. UI/UX Audit

Таблица:

| Problem | Location | Evidence | Impact | Effort | Risk | Priority | Recommendation |
| ------- | -------- | -------- | ------ | ------ | ---- | -------- | -------------- |

## D. E-Commerce Conversion Audit

Таблица:

| User Flow | Problem | Friction | Impact | Recommendation |
| --------- | ------- | -------- | ------ | -------------- |

## E. SEO Audit

Таблица:

| SEO Issue | Location | Evidence | Impact | Effort | Priority | Recommendation |
| --------- | -------- | -------- | ------ | ------ | -------- | -------------- |

## F. Design System Recommendations

Что и почему необходимо унифицировать.

## G. Architecture Recommendations

Только необходимые изменения.

## H. Implementation Roadmap

Phase 0 → Phase 5.

## I. Quick Wins

Самые выгодные изменения для первого этапа.

## J. Risks

Основные риски и способы их предотвращения.

## K. Definition of Done

Критерии завершения.

---

# FINAL RULES

1. **Сначала изучи реальный проект.**
2. **Не пиши код на этапе аудита.**
3. **Не выдумывай проблемы, которые не подтверждены.**
4. **Не меняй React + TypeScript + Vite.**
5. **Не предлагай Next.js как автоматическое решение SEO.**
6. **Не переписывай существующую архитектуру без объективной необходимости.**
7. **Не меняй бизнес-логику и API-контракты.**
8. **Не создавай чрезмерные абстракции.**
9. **Не жертвуй SEO ради визуального дизайна.**
10. **Не жертвуй UX ради SEO.**
11. **Не жертвуй performance ради визуальных эффектов.**
12. **Каждая существенная рекомендация должна иметь основание.**
13. **Приоритет — улучшение существующего продукта, а не создание нового с нуля.**
14. **Главная бизнес-цель — увеличить конверсию через понятность, доверие и снижение friction.**
15. **После завершения аудита сначала предоставь план. К реализации переходи только после отдельного подтверждения.**
