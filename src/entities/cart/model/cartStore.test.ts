import {
  CART_STORAGE_KEY,
  CART_STORAGE_VERSION,
  migrateCartState,
  useCartStore,
} from './cartStore';
import { createCartQuantityRules } from './decimal';

const ADDED_AT = '2026-07-30T12:00:00.000Z';

function getRules() {
  const rules = createCartQuantityRules('1', '1', '3');

  if (rules === null) {
    throw new Error('Для теста необходимы корректные правила количества.');
  }

  return rules;
}

beforeEach(() => {
  useCartStore.setState({
    hasHydrated: false,
    items: [],
  });
  useCartStore.persist.clearStorage();
});

describe('cart store', () => {
  it('adds a line and merges the same variant up to the maximum', () => {
    const rules = getRules();

    useCartStore.getState().addItem({
      addedAt: ADDED_AT,
      initialQuantity: rules.min,
      rules,
      variantId: 'variant-1',
    });
    useCartStore.getState().addItem({
      addedAt: '2026-07-30T13:00:00.000Z',
      initialQuantity: rules.min,
      rules,
      variantId: 'variant-1',
    });
    useCartStore.getState().addItem({
      initialQuantity: rules.min,
      rules,
      variantId: 'variant-1',
    });
    useCartStore.getState().addItem({
      initialQuantity: rules.min,
      rules,
      variantId: 'variant-1',
    });

    expect(useCartStore.getState().items).toEqual([
      {
        addedAt: ADDED_AT,
        quantity: '3',
        variantId: 'variant-1',
      },
    ]);
  });

  it('changes, increments and decrements a quantity with normalization', () => {
    const rules = getRules();

    useCartStore.getState().addItem({
      addedAt: ADDED_AT,
      initialQuantity: rules.min,
      rules,
      variantId: 'variant-1',
    });
    useCartStore.getState().setQuantity('variant-1', '2.6', rules);
    expect(useCartStore.getState().items[0]?.quantity).toBe('3');

    useCartStore.getState().decrementItem('variant-1', rules);
    expect(useCartStore.getState().items[0]?.quantity).toBe('2');

    useCartStore.getState().incrementItem('variant-1', rules);
    expect(useCartStore.getState().items[0]?.quantity).toBe('3');
  });

  it('supports a fractional step without number arithmetic', () => {
    const rules = createCartQuantityRules('0.5', '0.5', null);

    if (rules === null) {
      throw new Error('Для теста необходимы корректные дробные правила.');
    }

    useCartStore.getState().addItem({
      addedAt: ADDED_AT,
      initialQuantity: rules.min,
      rules,
      variantId: 'variant-fractional',
    });
    useCartStore.getState().incrementItem('variant-fractional', rules);

    expect(useCartStore.getState().items[0]?.quantity).toBe('1');
  });

  it('removes one line and clears the cart', () => {
    const rules = getRules();

    for (const variantId of ['variant-1', 'variant-2']) {
      useCartStore.getState().addItem({
        addedAt: ADDED_AT,
        initialQuantity: rules.min,
        rules,
        variantId,
      });
    }

    useCartStore.getState().removeItem('variant-1');
    expect(useCartStore.getState().items.map((item) => item.variantId)).toEqual(['variant-2']);

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('persists only stable cart line fields under a versioned key', () => {
    const rules = getRules();

    useCartStore.getState().addItem({
      addedAt: ADDED_AT,
      initialQuantity: rules.min,
      rules,
      variantId: 'variant-1',
    });

    const storedValue = localStorage.getItem(CART_STORAGE_KEY);

    expect(storedValue).not.toBeNull();
    expect(storedValue === null ? null : JSON.parse(storedValue)).toEqual({
      state: {
        items: [
          {
            addedAt: ADDED_AT,
            quantity: '1',
            variantId: 'variant-1',
          },
        ],
      },
      version: CART_STORAGE_VERSION,
    });
  });

  it('provides a safe migration point and resets an unsupported state', () => {
    const versionZeroState = {
      items: [
        {
          addedAt: ADDED_AT,
          quantity: '1',
          variantId: 'variant-1',
        },
      ],
    };

    expect(migrateCartState(versionZeroState, 0)).toEqual(versionZeroState);
    expect(migrateCartState({ legacy: true }, 99)).toEqual({ items: [] });
  });

  it('restores valid localStorage data and removes a damaged payload', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        state: {
          items: [
            {
              addedAt: ADDED_AT,
              quantity: '1.5',
              variantId: 'variant-restored',
            },
          ],
        },
        version: CART_STORAGE_VERSION,
      }),
    );

    await useCartStore.persist.rehydrate();

    expect(useCartStore.getState().items[0]).toEqual({
      addedAt: ADDED_AT,
      quantity: '1.5',
      variantId: 'variant-restored',
    });

    useCartStore.setState({ items: [] });
    localStorage.setItem(CART_STORAGE_KEY, '{damaged');

    await expect(useCartStore.persist.rehydrate()).resolves.toBeUndefined();
    expect(useCartStore.getState().items).toEqual([]);
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});
