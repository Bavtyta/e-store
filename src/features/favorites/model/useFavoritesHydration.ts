import { useEffect } from 'react';

import { useFavoritesStore } from './favoritesStore';

export function useFavoritesHydration(): void {
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated) return;

    let isActive = true;

    async function hydrate(): Promise<void> {
      try {
        await useFavoritesStore.persist.rehydrate();
      } finally {
        if (isActive) useFavoritesStore.setState({ hasHydrated: true });
      }
    }

    if (useFavoritesStore.persist.hasHydrated()) {
      useFavoritesStore.setState({ hasHydrated: true });
      return;
    }

    void hydrate();
    return () => {
      isActive = false;
    };
  }, [hasHydrated]);
}
