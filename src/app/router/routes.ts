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
        path: '/favorites',
        lazy: async () => {
          const { FavoritesPage } = await import('@/pages/favorites');

          return { Component: FavoritesPage };
        },
      },
      {
        path: '/login',
        lazy: async () => {
          const { LoginPage } = await import('@/pages/demo-forms');
          return { Component: LoginPage };
        },
      },
      {
        path: '/selection-help',
        lazy: async () => {
          const { SelectionHelpPage } = await import('@/pages/demo-forms');
          return { Component: SelectionHelpPage };
        },
      },
      {
        path: '/contacts',
        lazy: async () => {
          const { ContactsPage } = await import('@/pages/information');

          return { Component: ContactsPage };
        },
      },
      {
        path: '/about',
        lazy: async () => {
          const { AboutPage } = await import('@/pages/information');
          return { Component: AboutPage };
        },
      },
      {
        path: '/services',
        lazy: async () => {
          const { ServicesPage } = await import('@/pages/information');
          return { Component: ServicesPage };
        },
      },
      {
        path: '/delivery',
        lazy: async () => {
          const { DeliveryPage } = await import('@/pages/information');
          return { Component: DeliveryPage };
        },
      },
      {
        path: '/wholesale',
        lazy: async () => {
          const { WholesalePage } = await import('@/pages/information');
          return { Component: WholesalePage };
        },
      },
      {
        path: '/offers',
        lazy: async () => {
          const { OffersPage } = await import('@/pages/information');
          return { Component: OffersPage };
        },
      },
      {
        path: '/support',
        lazy: async () => {
          const { SupportPage } = await import('@/pages/information');
          return { Component: SupportPage };
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
