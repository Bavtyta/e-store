import { setupServer } from 'msw/node';

import { getCategories, getCategory } from '@/entities/category';
import { getProduct, getProducts, resolveProductVariants } from '@/entities/product';
import { apiClient, AppError } from '@/shared/api';

import { ARCHIVED_PRODUCT_SLUG, REMOVED_VARIANT_ID, storefrontProductFixtures } from './data';
import { handlers } from './handlers';
import { MSW_SCENARIO_HEADER } from './scenarios';
import type { MockScenario } from './scenarios';

const server = setupServer(...handlers);

function setScenario(scenario: MockScenario): void {
  apiClient.defaults.headers.common[MSW_SCENARIO_HEADER] = scenario;
}

function clearScenario(): void {
  apiClient.defaults.headers.common[MSW_SCENARIO_HEADER] = undefined;
}

beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  });
});

afterEach(() => {
  clearScenario();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('Storefront API integration with MSW', () => {
  it('loads category and product lists through the shared Axios client', async () => {
    const [categories, products] = await Promise.all([getCategories(), getProducts()]);

    expect(categories.length).toBeGreaterThan(0);
    expect(products.items).toHaveLength(20);
    expect(products.pagination).toEqual({
      limit: 20,
      page: 1,
      total: 20,
      totalPages: 1,
    });
  });

  it('loads one category by slug', async () => {
    const category = await getCategory('pnd');

    expect(category.name).toBe('ПНД');
  });

  it('applies server pagination', async () => {
    const products = await getProducts({
      limit: 5,
      page: 2,
    });

    expect(products.items).toHaveLength(5);
    expect(products.pagination).toEqual({
      limit: 5,
      page: 2,
      total: 20,
      totalPages: 4,
    });
  });

  it('applies server search', async () => {
    const products = await getProducts({
      search: 'ножницы',
    });

    expect(products.items).toHaveLength(1);
    expect(products.items[0]?.slug).toBe('nozhnicy-dlya-polimernyh-trub');
  });

  it('applies category and attribute filters', async () => {
    const products = await getProducts({
      category: 'truby',
      filters: {
        material: 'ПНД',
      },
    });

    expect(products.items).toHaveLength(1);
    expect(products.items[0]?.slug).toBe('truba-pnd-pe100-pitevaya');
  });

  it('combines values within a facet by OR and different facets by AND', async () => {
    const products = await getProducts({
      filters: {
        availability: 'in_stock',
        material: 'ПВХ,ПНД',
      },
    });

    expect(products.items.length).toBeGreaterThan(1);
    expect(products.items.every((item) => item.availability.status === 'in_stock')).toBe(true);

    const materialFacet = products.facets?.find((facet) => facet.code === 'material');
    const pvcOption = materialFacet?.options?.find((option) => option.value === 'ПВХ');
    const pndOption = materialFacet?.options?.find((option) => option.value === 'ПНД');

    expect(pvcOption?.selected).toBe(true);
    expect(pndOption?.selected).toBe(true);
    expect(pvcOption?.count).toBeGreaterThan(0);
    expect(pndOption?.count).toBeGreaterThan(0);
  });

  it('sorts products by ascending price with unknown prices last', async () => {
    const products = await getProducts({
      sort: 'price_asc',
    });
    const knownPrices = products.items
      .map((item) => item.priceFrom?.amountMinor)
      .filter((price): price is number => price !== undefined);

    expect(knownPrices).toEqual([...knownPrices].sort((first, second) => first - second));
    expect(products.items.at(-1)?.priceFrom).toBeNull();
  });

  it('loads one product and hides archived products', async () => {
    const product = await getProduct('truba-pnd-pe100-pitevaya');

    expect(product.variants.length).toBeGreaterThan(1);

    await expect(getProduct(ARCHIVED_PRODUCT_SLUG)).rejects.toMatchObject({
      kind: 'not-found',
      status: 404,
    });
  });

  it('maps a 404 response to one safe AppError', async () => {
    await expect(getProduct('missing-product')).rejects.toEqual(
      expect.objectContaining({
        code: 'PRODUCT_NOT_FOUND',
        kind: 'not-found',
        message: 'Запрошенные данные не найдены.',
        status: 404,
      }),
    );
  });

  it('maps a 500 response to a retryable server error', async () => {
    setScenario('server-error');

    await expect(getProducts()).rejects.toEqual(
      expect.objectContaining({
        code: 'INTERNAL_ERROR',
        isRetryable: true,
        kind: 'server',
        status: 500,
      }),
    );
  });

  it('maps a network failure to a retryable network error', async () => {
    setScenario('network-error');

    await expect(getProducts()).rejects.toEqual(
      expect.objectContaining({
        isRetryable: true,
        kind: 'network',
        status: undefined,
      }),
    );
  });

  it('rejects an invalid response before it reaches application code', async () => {
    setScenario('invalid-response');

    await expect(getProducts()).rejects.toBeInstanceOf(AppError);
    await expect(getProducts()).rejects.toMatchObject({
      isRetryable: false,
      kind: 'unknown',
      message: 'Сервис вернул данные в неподдерживаемом формате.',
    });
  });

  it('returns an empty product list for the explicit local scenario', async () => {
    setScenario('empty');

    const products = await getProducts();

    expect(products.items).toEqual([]);
    expect(products.pagination.total).toBe(0);
    expect(products.pagination.totalPages).toBe(0);
  });

  it('rejects invalid pagination as a non-retryable 400 error', async () => {
    await expect(
      getProducts({
        page: 0,
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_PRODUCT_QUERY',
      isRetryable: false,
      kind: 'validation',
      status: 400,
    });
  });

  it('resolves active variants and reports removed identifiers', async () => {
    const variantId = storefrontProductFixtures[0]?.details.variants[0]?.id;

    if (variantId === undefined) {
      throw new Error('Для integration-теста необходим хотя бы один вариант.');
    }

    const response = await resolveProductVariants({
      variantIds: [variantId, REMOVED_VARIANT_ID],
    });

    expect(response.items.map((item) => item.variant.id)).toEqual([variantId]);
    expect(response.items[0]?.product.name).toBeTruthy();
    expect(response.missingVariantIds).toEqual([REMOVED_VARIANT_ID]);
  });

  it('models changed price and availability during variant resolve', async () => {
    const originalVariant = storefrontProductFixtures
      .flatMap((fixture) => fixture.details.variants)
      .find((variant) => variant.price !== null);
    const originalPrice = originalVariant?.price;

    if (originalVariant === undefined || originalPrice === undefined || originalPrice === null) {
      throw new Error('Для integration-теста необходим вариант с ценой.');
    }

    setScenario('changed-price');
    const changedPriceResponse = await resolveProductVariants({
      variantIds: [originalVariant.id],
    });

    expect(changedPriceResponse.items[0]?.variant.price?.amountMinor).toBe(
      originalPrice.amountMinor + 500,
    );
    expect(changedPriceResponse.items[0]?.variant.oldPrice).toEqual(originalPrice);

    setScenario('changed-availability');
    const changedAvailabilityResponse = await resolveProductVariants({
      variantIds: [originalVariant.id],
    });

    expect(changedAvailabilityResponse.items[0]?.variant.availability.status).toBe('out_of_stock');
    expect(changedAvailabilityResponse.items[0]?.variant.availableQuantity).toBeNull();
  });
});
