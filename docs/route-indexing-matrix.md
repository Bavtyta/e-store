# Route and indexing matrix

This is the Phase 0 inventory for the current React + Vite SPA. It records the intended
indexing policy without changing the existing FSD routing or API contracts.

| Route                   | Current client status                             | Indexing policy                                            | Canonical policy                                            | Phase 0 decision                                             |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------ |
| `/`                     | `200` after client bootstrap                      | `index, follow`                                            | `/`                                                         | Include in sitemap                                           |
| `/catalog`              | `200` after client bootstrap                      | `index, follow` when data is available                     | `/catalog`                                                  | Include in sitemap                                           |
| `/catalog/*`            | `200` shell; entity errors render client-side     | Index only when category SEO data allows it                | Category SEO canonical or resolved path                     | Dynamic route; add to sitemap during SSR/prerender migration |
| `/product/:productSlug` | `200` shell; entity errors render client-side     | Index only when product SEO data allows it                 | Product SEO canonical or resolved slug                      | Dynamic route; add to sitemap during SSR/SSR data loading    |
| `/cart`                 | `200` after client bootstrap                      | `noindex, nofollow`                                        | `/cart`                                                     | Exclude from sitemap                                         |
| `/favorites`            | `200` after client bootstrap                      | `noindex, nofollow`                                        | `/favorites`                                                | Local device state; exclude from sitemap                     |
| `/login`                | `200` after client bootstrap                      | `noindex, nofollow`                                        | `/login`                                                    | Demo route; exclude from sitemap                             |
| `/selection-help`       | `200` after client bootstrap                      | `noindex, nofollow`                                        | `/selection-help`                                           | Demo form; exclude from sitemap                              |
| `/about`                | `200` after client bootstrap                      | `noindex, nofollow` until approved content exists          | `/about`                                                    | Exclude from sitemap                                         |
| `/services`             | `200` after client bootstrap                      | `noindex, nofollow` until approved content exists          | `/services`                                                 | Exclude from sitemap                                         |
| `/delivery`             | `200` after client bootstrap                      | `noindex, nofollow` until approved conditions exist        | `/delivery`                                                 | Exclude from sitemap                                         |
| `/contacts`             | `200` after client bootstrap                      | `noindex, nofollow` until approved content exists          | `/contacts`                                                 | Exclude from sitemap                                         |
| `/wholesale`            | `200` after client bootstrap                      | `noindex, nofollow` until approved conditions exist        | `/wholesale`                                                | Exclude from sitemap                                         |
| `/support`              | `200` after client bootstrap                      | `noindex, nofollow` until approved contacts exist          | `/support`                                                  | Exclude from sitemap                                         |
| `/privacy`              | `200` after client bootstrap                      | `noindex, nofollow` until legal publication policy changes | `/privacy`                                                  | Exclude from sitemap                                         |
| `/terms`                | `200` after client bootstrap                      | `noindex, nofollow` until legal publication policy changes | `/terms`                                                    | Exclude from sitemap                                         |
| `/ui-preview`           | Dev-only route                                    | `noindex, nofollow`; not present in production routes      | `/ui-preview`                                               | Exclude from sitemap                                         |
| `*`                     | Client-side fallback currently renders the 404 UI | `noindex, nofollow`                                        | No production canonical until server status handling exists | HTTP 404 remains part of ADR-0001 migration                  |

## Phase 0 artifacts

- `robots.txt` and `sitemap.xml` are generated by the existing Vite configuration for both the
  development server and production output.
- The sitemap contains only routes whose indexability is currently unconditional and whose
  canonical URL is known without API data: `/` and `/catalog`.
- Category and product URLs must be added by the accepted SSR/prerender migration once their
  API-backed SEO status and canonical URL are resolved. Fixtures are intentionally not used to
  generate production SEO assets.
- Query-string discovery URLs are disallowed in `robots.txt` until a deliberate search/filter/
  sorting/pagination indexing policy is implemented.

## Deferred architectural boundary

The current Vite SPA still cannot emit route-specific HTML before JavaScript or return HTTP 404/500
for unknown routes. ADR-0001 explicitly reserves that work for the React Router Framework Mode SSR /
prerender migration. Phase 0 records this release blocker and does not duplicate route loading,
metadata, or API logic in the client router.
