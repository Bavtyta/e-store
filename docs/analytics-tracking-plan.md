# План аналитики каталога

Каталог использует vendor-neutral `AnalyticsReporter`. В `local` и `test` события
публикуются как browser event `storefront:analytics`. В `staging` и `production`
adapter остаётся `no-op`, пока не согласованы провайдер, consent flow, privacy policy
и CSP. Наличие `VITE_ANALYTICS_ID` само по себе внешний transport не включает.

## События

| Событие                               | Назначение                         | Разрешённые свойства                                                     |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `catalog_search_submitted`            | явная отправка поиска              | `surface`, `category_id`, `query_length`, `recognized_filter_count`      |
| `catalog_filter_applied`              | добавление/изменение группы        | `surface`, `category_id`, `filter_code`, `selected_count`, `interaction` |
| `catalog_filter_removed`              | уменьшение выбора группы           | те же                                                                    |
| `catalog_filters_reset`               | полный сброс                       | `surface`, `category_id`, counts до сброса, `interaction`                |
| `catalog_sort_changed`                | изменение сортировки               | `surface`, `category_id`, `sort`, `interaction`                          |
| `catalog_results_viewed`              | показ набора или zero result       | count/page/sort, длина запроса, counts фильтров, `empty_reason`          |
| `catalog_product_opened`              | переход по изображению/названию    | `product_id`, `position`, `page`, `trigger`                              |
| `catalog_variant_selection_requested` | переход к обязательному выбору SKU | `product_id`, `variant_count`, `position`, `page`                        |
| `catalog_add_to_cart`                 | успешное локальное добавление      | `product_id`, `variant_id`, `quantity`, `position`, `page`               |
| `catalog_recovery_selected`           | действие из пустого состояния      | `empty_reason`, `action`                                                 |

`interaction` различает `sidebar`, `summary`, `mobile_drawer`, `toolbar` и
`empty_state`. Изменения мобильного черновика отправляются только после кнопки
«Показать товары»; закрытие Dialog не создаёт события фильтра или сортировки.

## Privacy allowlist

Не отправляются исходный поисковый запрос, значения facet-фильтров, URL/query string,
название товара, путь категории, содержимое корзины и любые PII. Код фильтра,
идентификаторы и quantity проходят ограничение формата/длины; числовые значения
ограничиваются безопасным диапазоном. Ошибка adapter никогда не блокирует поиск,
навигацию или добавление в корзину.
