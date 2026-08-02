import { useEffect } from 'react';

import { useCartStore } from './cartStore';

export function useCartHydration(): boolean {
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      return;
    }

    let isActive = true;

    async function hydrate(): Promise<void> {
      try {
        await useCartStore.persist.rehydrate();
      } finally {
        if (isActive) {
          useCartStore.setState({ hasHydrated: true });
        }
      }
    }

    if (useCartStore.persist.hasHydrated()) {
      useCartStore.setState({ hasHydrated: true });
      return;
    }

    void hydrate();

    return () => {
      isActive = false;
    };
  }, [hasHydrated]);

  return hasHydrated;
}
