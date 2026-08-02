import type { RouteObject } from 'react-router';

function RouteHydrateFallback() {
  return null;
}

export const appRoutes = [
  {
    path: '/',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { HomePage } = await import('@/pages/home');

      return { Component: HomePage };
    },
  },
  {
    path: '/catalog',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { CatalogPage } = await import('@/pages/catalog');

      return { Component: CatalogPage };
    },
  },
  {
    path: '/catalog/*',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { CategoryPage } = await import('@/pages/category');

      return { Component: CategoryPage };
    },
  },
  {
    path: '/product/:productSlug',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { ProductPage } = await import('@/pages/product');

      return { Component: ProductPage };
    },
  },
  {
    path: '/cart',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { CartPage } = await import('@/pages/cart');

      return { Component: CartPage };
    },
  },
  {
    path: '/contacts',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { ContactsPage } = await import('@/pages/contacts');

      return { Component: ContactsPage };
    },
  },
  {
    path: '/privacy',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { PrivacyPage } = await import('@/pages/privacy');

      return { Component: PrivacyPage };
    },
  },
  {
    path: '/terms',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { TermsPage } = await import('@/pages/terms');

      return { Component: TermsPage };
    },
  },
  ...(__DEV_SERVER__
    ? [
        {
          path: '/ui-preview',
          HydrateFallback: RouteHydrateFallback,
          lazy: async () => {
            const { UiPreviewPage } = await import('@/pages/ui-preview');

            return { Component: UiPreviewPage };
          },
        },
      ]
    : []),
  {
    path: '*',
    HydrateFallback: RouteHydrateFallback,
    lazy: async () => {
      const { NotFoundPage } = await import('@/pages/not-found');

      return { Component: NotFoundPage };
    },
  },
] satisfies RouteObject[];
