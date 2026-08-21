import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const FAVORITES_STORAGE_KEY = 'storefront-favorites-v1';
export const FAVORITES_STORAGE_VERSION = 1;

const persistedFavoritesSchema = z.strictObject({
  productIds: z.array(z.string().min(1)),
});

interface FavoritesState {
  hasHydrated: boolean;
  productIds: string[];
  toggle: (productId: string) => void;
}

export function migrateFavoritesState(persistedState: unknown): { productIds: string[] } {
  const result = persistedFavoritesSchema.safeParse(persistedState);

  return result.success ? { productIds: [...new Set(result.data.productIds)] } : { productIds: [] };
}

export const useFavoritesStore = create<FavoritesState>()(
  persist<FavoritesState, [], [], { productIds: string[] }>(
    (set) => ({
      hasHydrated: false,
      productIds: [],
      toggle: (productId) => {
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        }));
      },
    }),
    {
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateFavoritesState(persistedState),
        hasHydrated: currentState.hasHydrated,
      }),
      migrate: migrateFavoritesState,
      name: FAVORITES_STORAGE_KEY,
      partialize: (state) => ({ productIds: state.productIds }),
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      version: FAVORITES_STORAGE_VERSION,
    },
  ),
);

export const selectFavoriteCount = (state: FavoritesState): number => state.productIds.length;
