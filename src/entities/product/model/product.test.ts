import {
  mapProductDetailsDto,
  mapProductListItemDto,
  mapProductVariantDto,
  productDetailsSchema,
  productListItemSchema,
  productVariantSchema,
} from '@/entities/product';
import type {
  Attribute,
  Availability,
  ProductDetails,
  ProductListItem,
  ProductUnit,
  ProductVariant,
  VariantOptionValue,
} from '@/entities/product';
import type { Image, Money } from '@/shared/model';

function createMoney(): Money {
  return {
    amountMinor: 12_345,
    currency: 'RUB',
  };
}

function createImage(): Image {
  return {
    alt: 'Тестовое изображение',
    height: 600,
    id: 'image-1',
    sortOrder: 0,
    url: '/images/test.webp',
    width: 800,
  };
}

function createAvailability(): Availability {
  return {
    message: null,
    status: 'in_stock',
  };
}

function createUnit(): ProductUnit {
  return {
    code: 'piece',
    label: 'шт.',
  };
}

function createAttribute(): Attribute {
  return {
    code: 'attribute-code',
    group: null,
    name: 'Тестовый атрибут',
    sortOrder: 0,
    unit: null,
    value: 'Значение',
  };
}

function createOptionValue(): VariantOptionValue {
  return {
    code: 'option-code',
    label: 'Вариант',
    value: 'variant-value',
  };
}

function createProductVariantDto(): ProductVariant {
  return {
    attributes: [createAttribute()],
    availability: createAvailability(),
    availableQuantity: null,
    externalId: null,
    id: 'variant-1',
    imageId: 'image-1',
    maxOrderQuantity: null,
    minOrderQuantity: '1',
    name: 'Тестовый вариант',
    oldPrice: null,
    optionValues: [createOptionValue()],
    packageQuantity: null,
    price: createMoney(),
    priceType: 'fixed',
    quantityStep: '1',
    sku: 'TEST-001',
    unit: createUnit(),
  };
}

function createProductDetailsDto(): ProductDetails {
  return {
    attributes: [createAttribute()],
    category: {
      id: 'category-1',
      name: 'Тестовая категория',
      path: '/catalog/test-category',
    },
    createdAt: '2026-01-01T00:00:00Z',
    description: null,
    externalId: null,
    id: 'product-1',
    images: [createImage()],
    name: 'Тестовая модель товара',
    optionGroups: [
      {
        code: 'option-group',
        name: 'Параметр',
        sortOrder: 0,
        values: [createOptionValue()],
      },
    ],
    seo: {
      canonicalUrl: null,
      description: null,
      indexable: true,
      title: null,
    },
    slug: 'test-product',
    status: 'active',
    updatedAt: '2026-01-01T00:00:00Z',
    variants: [createProductVariantDto()],
  };
}

function createProductListItemDto(): ProductListItem {
  return {
    addToCartTarget: {
      id: 'product-1-variant-default',
      maxOrderQuantity: null,
      minOrderQuantity: '1',
      quantityStep: '1',
    },
    availability: createAvailability(),
    badges: [],
    categoryId: 'category-1',
    id: 'product-1',
    name: 'Тестовая модель товара',
    priceFrom: createMoney(),
    priceTo: null,
    primaryUnit: createUnit(),
    shortAttributes: [createAttribute()],
    slug: 'test-product',
    thumbnail: createImage(),
  };
}

describe('Product models', () => {
  it('validates and maps a correct ProductDetails DTO', () => {
    const dto = createProductDetailsDto();

    expect(productDetailsSchema.safeParse(dto).success).toBe(true);

    const result = mapProductDetailsDto(dto);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(dto);
    }
  });

  it('validates list item and variant DTOs through their public mappers', () => {
    const listItemDto = createProductListItemDto();
    const variantDto = createProductVariantDto();

    expect(productListItemSchema.safeParse(listItemDto).success).toBe(true);
    expect(productVariantSchema.safeParse(variantDto).success).toBe(true);
    expect(mapProductListItemDto(listItemDto).success).toBe(true);
    expect(mapProductVariantDto(variantDto).success).toBe(true);
  });

  it('rejects an unsupported product status without throwing', () => {
    const invalidDto = {
      ...createProductDetailsDto(),
      status: 'draft',
    };

    expect(() => mapProductDetailsDto(invalidDto)).not.toThrow();
    expect(mapProductDetailsDto(invalidDto).success).toBe(false);
  });

  it('rejects an incomplete CategoryReference safely', () => {
    const invalidDto = {
      ...createProductDetailsDto(),
      category: {
        id: 'category-1',
        name: 'Тестовая категория',
      },
    };

    expect(mapProductDetailsDto(invalidDto).success).toBe(false);
  });

  it('rejects an unknown CategoryReference field safely', () => {
    const invalidDto = {
      ...createProductDetailsDto(),
      category: {
        ...createProductDetailsDto().category,
        slug: 'test-category',
      },
    };

    expect(mapProductDetailsDto(invalidDto).success).toBe(false);
  });
});
