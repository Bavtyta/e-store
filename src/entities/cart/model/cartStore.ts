import { z } from 'zod';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { StateStorage } from 'zustand/middleware';

import {
  addCartQuantities,
  decrementCartQuantity,
  incrementCartQuantity,
  normalizeCartQuantity,
} from './decimal';
import type { CartQuantityRules } from './decimal';
import { cartPersistedStateSchema } from './cart';
import type { CartItem, CartPersistedState } from './cart';

export const CART_STORAGE_KEY = 'storefront-cart-v1';
export const CART_STORAGE_VERSION = 1;

const storageEnvelopeSchema = z.strictObject({
  state: z.unknown(),
  version: z.number().int().optional(),
});

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function removeStoredValue(name: string): void {
  try {
    getLocalStorage()?.removeItem(name);
  } catch {
    // Storage can be unavailable because of browser privacy settings.
  }
}

const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      const rawValue = getLocalStorage()?.getItem(name) ?? null;

      if (rawValue === null) {
        return null;
      }

      const parsedJson: unknown = JSON.parse(rawValue);
      const envelopeResult = storageEnvelopeSchema.safeParse(parsedJson);

      if (!envelopeResult.success) {
        removeStoredValue(name);
        return null;
      }

      if (
        envelopeResult.data.version === CART_STORAGE_VERSION &&
        !cartPersistedStateSchema.safeParse(envelopeResult.data.state).success
      ) {
        removeStoredValue(name);
        return null;
      }

      return rawValue;
    } catch {
      removeStoredValue(name);
      return null;
    }
  },
  removeItem: (name) => {
    removeStoredValue(name);
  },
  setItem: (name, value) => {
    try {
      getLocalStorage()?.setItem(name, value);
    } catch {
      // A full or unavailable storage must not break cart interactions.
    }
  },
};

const cartStorage = createJSONStorage<CartPersistedState>(() => safeLocalStorage);

export interface AddCartItemInput {
  addedAt?: string;
  initialQuantity: string;
  rules: CartQuantityRules;
  variantId: string;
}

interface CartState {
  addItem: (input: AddCartItemInput) => void;
  clearCart: () => void;
  decrementItem: (variantId: string, rules: CartQuantityRules) => void;
  hasHydrated: boolean;
  incrementItem: (variantId: string, rules: CartQuantityRules) => void;
  items: CartItem[];
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: string, rules: CartQuantityRules) => void;
}

function updateItemQuantity(
  items: readonly CartItem[],
  variantId: string,
  update: (quantity: string) => string,
): CartItem[] {
  return items.map((item) =>
    item.variantId === variantId
      ? {
          ...item,
          quantity: update(item.quantity),
        }
      : item,
  );
}

export function migrateCartState(persistedState: unknown, version: number): CartPersistedState {
  switch (version) {
    case 0:
    case CART_STORAGE_VERSION: {
      const result = cartPersistedStateSchema.safeParse(persistedState);

      return result.success ? result.data : { items: [] };
    }
    default:
      return { items: [] };
  }
}

export const useCartStore = create<CartState>()(
  persist<CartState, [], [], CartPersistedState>(
    (set) => ({
      addItem: ({ addedAt, initialQuantity, rules, variantId }) => {
        const normalizedInitialQuantity = normalizeCartQuantity(initialQuantity, rules);

        set((state) => {
          const existingItem = state.items.find((item) => item.variantId === variantId);

          if (existingItem !== undefined) {
            return {
              items: updateItemQuantity(state.items, variantId, (quantity) =>
                addCartQuantities(quantity, normalizedInitialQuantity, rules),
              ),
            };
          }

          const candidateAddedAt = addedAt ?? new Date().toISOString();
          const parsedAddedAt = new Date(candidateAddedAt);
          const safeAddedAt =
            !Number.isNaN(parsedAddedAt.getTime()) &&
            parsedAddedAt.toISOString() === candidateAddedAt
              ? candidateAddedAt
              : new Date().toISOString();

          return {
            items: [
              ...state.items,
              {
                addedAt: safeAddedAt,
                quantity: normalizedInitialQuantity,
                variantId,
              },
            ],
          };
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
      decrementItem: (variantId, rules) => {
        set((state) => ({
          items: updateItemQuantity(state.items, variantId, (quantity) =>
            decrementCartQuantity(quantity, rules),
          ),
        }));
      },
      hasHydrated: false,
      incrementItem: (variantId, rules) => {
        set((state) => ({
          items: updateItemQuantity(state.items, variantId, (quantity) =>
            incrementCartQuantity(quantity, rules),
          ),
        }));
      },
      items: [],
      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }));
      },
      setQuantity: (variantId, quantity, rules) => {
        set((state) => ({
          items: updateItemQuantity(state.items, variantId, () =>
            normalizeCartQuantity(quantity, rules),
          ),
        }));
      },
    }),
    {
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...migrateCartState(persistedState, CART_STORAGE_VERSION),
        hasHydrated: currentState.hasHydrated,
      }),
      migrate: migrateCartState,
      name: CART_STORAGE_KEY,
      partialize: (state) => ({
        items: state.items,
      }),
      skipHydration: true,
      ...(cartStorage === undefined ? {} : { storage: cartStorage }),
      version: CART_STORAGE_VERSION,
    },
  ),
);

export const selectCartLineCount = (state: CartState): number => state.items.length;
