import { categorySchema } from '@/entities/category';
import {
  productDetailsSchema,
  productListResponseSchema,
  productVariantSchema,
  resolveVariantsResponseSchema,
} from '@/entities/product';
import { apiErrorEnvelopeSchema } from '@/shared/api';

import {
  ARCHIVED_PRODUCT_SLUG,
  categoryFixtures,
  productFixtures,
  REMOVED_VARIANT_ID,
  storefrontProductFixtures,
} from './data';

describe('Storefront API contract fixtures', () => {
  it('validates every category fixture and includes nested categories', () => {
    for (const category of categoryFixtures) {
      expect(categorySchema.safeParse(category).success).toBe(true);
    }

    expect(categoryFixtures.some((category) => category.parentId !== null)).toBe(true);
    expect(categoryFixtures.some((category) => category.childrenCount > 0)).toBe(true);
  });

  it('validates every product, list item and variant fixture', () => {
    for (const fixture of productFixtures) {
      expect(productDetailsSchema.safeParse(fixture.details).success).toBe(true);
      expect(fixture.details.category.id.length).toBeGreaterThan(0);
      expect(fixture.details.category.name.length).toBeGreaterThan(0);
      expect(fixture.details.category.path).toMatch(/^\/catalog\//);

      for (const variant of fixture.details.variants) {
        expect(productVariantSchema.safeParse(variant).success).toBe(true);
      }
    }

    const listResponse = {
      items: productFixtures.map((fixture) => fixture.listItem),
      pagination: {
        limit: productFixtures.length,
        page: 1,
        total: productFixtures.length,
        totalPages: 1,
      },
    };

    expect(productListResponseSchema.safeParse(listResponse).success).toBe(true);
  });

  it('contains at least 20 storefront products and never exposes the archived one', () => {
    expect(storefrontProductFixtures).toHaveLength(20);
    expect(
      productFixtures.some(
        (fixture) =>
          fixture.visibility === 'archived' && fixture.details.slug === ARCHIVED_PRODUCT_SLUG,
      ),
    ).toBe(true);
    expect(
      storefrontProductFixtures.some((fixture) => fixture.details.slug === ARCHIVED_PRODUCT_SLUG),
    ).toBe(false);
  });

  it('covers the required product and variant fixture scenarios', () => {
    expect(productFixtures.some((fixture) => fixture.details.variants.length === 1)).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.optionGroups.some((group) => group.code === 'diameter'),
      ),
    ).toBe(true);
    expect(productFixtures.some((fixture) => fixture.details.optionGroups.length > 1)).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.variants.some((variant) => variant.quantityStep === '0.5'),
      ),
    ).toBe(true);
    expect(productFixtures.some((fixture) => fixture.details.images.length === 0)).toBe(true);
    expect(productFixtures.some((fixture) => fixture.details.images.length > 1)).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.variants.some((variant) => variant.availability.status === 'out_of_stock'),
      ),
    ).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.variants.some((variant) => variant.availability.status === 'on_order'),
      ),
    ).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.variants.some((variant) => variant.priceType === 'fixed'),
      ),
    ).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.variants.some((variant) => variant.priceType === 'from'),
      ),
    ).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.variants.some((variant) => variant.priceType === 'on_request'),
      ),
    ).toBe(true);
    expect(
      productFixtures.some((fixture) =>
        fixture.details.variants.some((variant) => variant.oldPrice !== null),
      ),
    ).toBe(true);
  });

  it('validates resolve and error envelopes', () => {
    const firstFixture = storefrontProductFixtures[0];
    const firstVariant = firstFixture?.details.variants[0];

    if (firstFixture === undefined || firstVariant === undefined) {
      throw new Error('Для contract-теста необходим хотя бы один вариант.');
    }

    expect(
      resolveVariantsResponseSchema.safeParse({
        items: [
          {
            product: {
              id: firstFixture.details.id,
              image: firstFixture.details.images[0] ?? null,
              name: firstFixture.details.name,
              slug: firstFixture.details.slug,
            },
            variant: firstVariant,
          },
        ],
        missingVariantIds: [REMOVED_VARIANT_ID],
      }).success,
    ).toBe(true);

    expect(
      apiErrorEnvelopeSchema.safeParse({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          details: null,
          message: 'Товар не найден.',
          requestId: null,
        },
      }).success,
    ).toBe(true);
  });
});
