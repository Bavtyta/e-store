import type { RouteObject } from 'react-router';

import { RootLayout } from '@/app/layouts';

function RouteHydrateFallback() {
  return null;
}

export const appRoutes = [
  {
    Component: RootLayout,
    HydrateFallback: RouteHydrateFallback,
    children: [
      {
        path: '/',
        lazy: async () => {
          const { HomePage } = await import('@/pages/home');

          return { Component: HomePage };
        },
      },
      {
        path: '/catalog',
        lazy: async () => {
          const { CatalogPage } = await import('@/pages/catalog');

          return { Component: CatalogPage };
        },
      },
      {
        path: '/catalog/*',
        lazy: async () => {
          const { CategoryPage } = await import('@/pages/category');

          return { Component: CategoryPage };
        },
      },
      {
        path: '/product/:productSlug',
        lazy: async () => {
          const { ProductPage } = await import('@/pages/product');

          return { Component: ProductPage };
        },
      },
      {
        path: '/cart',
        lazy: async () => {
          const { CartPage } = await import('@/pages/cart');

          return { Component: CartPage };
        },
      },
      {
        path: '/contacts',
        lazy: async () => {
          const { ContactsPage } = await import('@/pages/contacts');

          return { Component: ContactsPage };
        },
      },
      {
        path: '/privacy',
        lazy: async () => {
          const { PrivacyPage } = await import('@/pages/privacy');

          return { Component: PrivacyPage };
        },
      },
      {
        path: '/terms',
        lazy: async () => {
          const { TermsPage } = await import('@/pages/terms');

          return { Component: TermsPage };
        },
      },
      ...(__DEV_SERVER__
        ? [
            {
              path: '/ui-preview',
              lazy: async () => {
                const { UiPreviewPage } = await import('@/pages/ui-preview');

                return { Component: UiPreviewPage };
              },
            },
          ]
        : []),
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('@/pages/not-found');

          return { Component: NotFoundPage };
        },
      },
    ],
  },
] satisfies RouteObject[];
