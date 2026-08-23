import type {
  Attribute,
  Availability,
  AvailabilityStatus,
  PriceType,
  ProductDetails,
  ProductListItem,
  ProductUnit,
  ProductUnitCode,
  ProductVariant,
  VariantOptionGroup,
  VariantOptionValue,
} from '@/entities/product';
import type { Image, Money } from '@/shared/model';

import { CATEGORY_IDS, findCategoryFixture } from './categories';

type FixtureVisibility = 'active' | 'archived';

interface ProductFixture {
  details: ProductDetails;
  listItem: ProductListItem;
  visibility: FixtureVisibility;
}

interface ProductSeed {
  attributes: readonly Attribute[];
  badges?: readonly string[];
  categoryId: string;
  description?: string;
  id: string;
  imageCount?: 0 | 1 | 3;
  name: string;
  slug: string;
  variants: readonly VariantSeed[];
  visibility?: FixtureVisibility;
}

interface VariantSeed {
  attributes?: readonly Attribute[];
  availabilityMessage?: string | null;
  availabilityStatus: AvailabilityStatus;
  availableQuantity?: string | null;
  imageIndex?: number;
  key: string;
  maxOrderQuantity?: string | null;
  minOrderQuantity: string;
  name: string;
  oldPriceMinor?: number | null;
  options: readonly VariantOptionValue[];
  packageQuantity?: string | null;
  priceMinor: number | null;
  priceType: PriceType;
  quantityStep: string;
  unitCode: ProductUnitCode;
}

const FIXTURE_CREATED_AT = '2026-01-15T09:00:00Z';
const FIXTURE_UPDATED_AT = '2026-07-01T09:00:00Z';

export const ARCHIVED_PRODUCT_SLUG = 'perehodnik-arhivnyj';
export const REMOVED_VARIANT_ID = 'variant-removed-from-catalog';

const unitLabels: Readonly<Record<ProductUnitCode, string>> = {
  kilogram: 'кг',
  meter: 'м',
  package: 'уп.',
  piece: 'шт.',
  roll: 'рулон',
  set: 'компл.',
};

function createMoney(amountMinor: number): Money {
  return {
    amountMinor,
    currency: 'RUB',
  };
}

function createUnit(code: ProductUnitCode): ProductUnit {
  return {
    code,
    label: unitLabels[code],
  };
}

function createAttribute(
  code: string,
  name: string,
  value: string | number | boolean,
  unit: string | null = null,
  sortOrder = 0,
): Attribute {
  return {
    code,
    group: 'Основные характеристики',
    name,
    sortOrder,
    unit,
    value,
  };
}

function createOption(code: string, label: string, value: string): VariantOptionValue {
  return {
    code,
    label,
    value,
  };
}

function createVariantSeed(
  key: string,
  name: string,
  priceMinor: number | null,
  options: readonly VariantOptionValue[] = [],
  overrides: Partial<VariantSeed> = {},
): VariantSeed {
  return {
    availabilityStatus: 'in_stock',
    key,
    minOrderQuantity: '1',
    name,
    options,
    priceMinor,
    priceType: priceMinor === null ? 'on_request' : 'fixed',
    quantityStep: '1',
    unitCode: 'piece',
    ...overrides,
  };
}

function getAvailability(
  status: AvailabilityStatus,
  message: string | null | undefined,
): Availability {
  const defaultMessages: Readonly<Record<AvailabilityStatus, string | null>> = {
    in_stock: 'В наличии',
    low_stock: 'Осталось мало',
    on_order: 'Под заказ',
    out_of_stock: 'Нет в наличии',
    unknown: null,
  };

  return {
    message: message === undefined ? defaultMessages[status] : message,
    status,
  };
}

function createImage(product: ProductSeed, sortOrder: number): Image {
  return {
    alt: `${product.name}, изображение ${String(sortOrder + 1)}`,
    height: 800,
    id: `${product.id}-image-${String(sortOrder + 1)}`,
    sortOrder,
    url: `/fixtures/products/${product.slug}-${String(sortOrder + 1)}.webp`,
    width: 1_000,
  };
}

function createImages(product: ProductSeed): Image[] {
  const imageCount = product.imageCount ?? 1;

  return Array.from({ length: imageCount }, (_, index) => createImage(product, index));
}

function createVariant(
  product: ProductSeed,
  seed: VariantSeed,
  images: readonly Image[],
): ProductVariant {
  const hasKnownStock =
    seed.availabilityStatus === 'in_stock' || seed.availabilityStatus === 'low_stock';
  const imageId = images[seed.imageIndex ?? 0]?.id ?? images[0]?.id ?? null;

  return {
    attributes: [...(seed.attributes ?? product.attributes)],
    availability: getAvailability(seed.availabilityStatus, seed.availabilityMessage),
    availableQuantity:
      seed.availableQuantity === undefined
        ? hasKnownStock
          ? '100'
          : null
        : seed.availableQuantity,
    externalId: null,
    id: `${product.id}-variant-${seed.key}`,
    imageId,
    maxOrderQuantity: seed.maxOrderQuantity ?? null,
    minOrderQuantity: seed.minOrderQuantity,
    name: seed.name,
    oldPrice:
      seed.oldPriceMinor === undefined || seed.oldPriceMinor === null
        ? null
        : createMoney(seed.oldPriceMinor),
    optionValues: [...seed.options],
    packageQuantity: seed.packageQuantity ?? null,
    price: seed.priceMinor === null ? null : createMoney(seed.priceMinor),
    priceType: seed.priceType,
    quantityStep: seed.quantityStep,
    sku: `SKU-${product.id.toUpperCase()}-${seed.key.toUpperCase()}`,
    unit: createUnit(seed.unitCode),
  };
}

function createOptionGroups(variants: readonly ProductVariant[]): VariantOptionGroup[] {
  const groupedValues = new Map<string, VariantOptionValue[]>();

  for (const variant of variants) {
    for (const option of variant.optionValues) {
      const existingValues = groupedValues.get(option.code) ?? [];
      const alreadyExists = existingValues.some((item) => item.value === option.value);

      if (!alreadyExists) {
        existingValues.push(option);
        groupedValues.set(option.code, existingValues);
      }
    }
  }

  return [...groupedValues.entries()].map(([code, values], index) => ({
    code,
    name: code === 'diameter' ? 'Диаметр' : code === 'pressure' ? 'Давление' : 'Исполнение',
    sortOrder: index,
    values,
  }));
}

function getPriceBounds(variants: readonly ProductVariant[]): {
  priceFrom: Money | null;
  priceTo: Money | null;
} {
  const amounts = variants.flatMap((variant) =>
    variant.price === null ? [] : [variant.price.amountMinor],
  );

  if (amounts.length === 0) {
    return {
      priceFrom: null,
      priceTo: null,
    };
  }

  const minimum = Math.min(...amounts);
  const maximum = Math.max(...amounts);

  return {
    priceFrom: createMoney(minimum),
    priceTo: minimum === maximum ? null : createMoney(maximum),
  };
}

function createProductFixture(seed: ProductSeed): ProductFixture {
  const images = createImages(seed);
  const variants = seed.variants.map((variant) => createVariant(seed, variant, images));
  const primaryVariant = variants[0];
  const category = findCategoryFixture(seed.categoryId);

  if (primaryVariant === undefined) {
    throw new Error(`Fixture ${seed.slug} должен содержать хотя бы один вариант.`);
  }

  if (category === undefined) {
    throw new Error(`Fixture ${seed.slug} ссылается на неизвестную категорию.`);
  }

  const prices = getPriceBounds(variants);

  return {
    details: {
      attributes: [...seed.attributes],
      category: {
        id: category.id,
        name: category.name,
        path: category.path,
      },
      createdAt: FIXTURE_CREATED_AT,
      description: seed.description ?? null,
      externalId: null,
      id: seed.id,
      images,
      name: seed.name,
      optionGroups: createOptionGroups(variants),
      seo: {
        canonicalUrl: `/product/${seed.slug}`,
        description: seed.description ?? null,
        indexable: true,
        title: seed.name,
      },
      slug: seed.slug,
      status: 'active',
      updatedAt: FIXTURE_UPDATED_AT,
      variants,
    },
    listItem: {
      addToCartTarget: {
        id: primaryVariant.id,
        maxOrderQuantity: primaryVariant.maxOrderQuantity,
        minOrderQuantity: primaryVariant.minOrderQuantity,
        quantityStep: primaryVariant.quantityStep,
      },
      availability: primaryVariant.availability,
      badges: [...(seed.badges ?? [])],
      categoryId: seed.categoryId,
      id: seed.id,
      name: seed.name,
      priceFrom: prices.priceFrom,
      priceTo: prices.priceTo,
      primaryUnit: primaryVariant.unit,
      shortAttributes: [...seed.attributes.slice(0, 3)],
      slug: seed.slug,
      thumbnail: images[0] ?? null,
    },
    visibility: seed.visibility ?? 'active',
  };
}

const productSeeds: readonly ProductSeed[] = [
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПНД'),
      createAttribute('application', 'Назначение', 'Питьевая вода'),
    ],
    badges: ['Рекомендуем'],
    categoryId: CATEGORY_IDS.pndPipes,
    description: 'Напорная труба ПНД PE100 для систем водоснабжения.',
    id: 'product-001',
    imageCount: 3,
    name: 'Труба ПНД PE100 питьевая',
    slug: 'truba-pnd-pe100-pitevaya',
    variants: [
      createVariantSeed('20', 'Диаметр 20 мм', 8_900, [createOption('diameter', '20 мм', '20')], {
        attributes: [createAttribute('diameter', 'Диаметр', 20, 'мм', 10)],
        imageIndex: 0,
      }),
      createVariantSeed('25', 'Диаметр 25 мм', 12_500, [createOption('diameter', '25 мм', '25')], {
        attributes: [createAttribute('diameter', 'Диаметр', 25, 'мм', 10)],
        imageIndex: 1,
      }),
      createVariantSeed('32', 'Диаметр 32 мм', 18_900, [createOption('diameter', '32 мм', '32')], {
        attributes: [createAttribute('diameter', 'Диаметр', 32, 'мм', 10)],
        imageIndex: 2,
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПВХ'),
      createAttribute('diameter', 'Диаметр', 110, 'мм'),
    ],
    categoryId: CATEGORY_IDS.pvcPipes,
    id: 'product-002',
    name: 'Труба ПВХ канализационная 110 мм',
    slug: 'truba-pvh-kanalizacionnaya-110',
    variants: [createVariantSeed('110', '110 × 2,2 мм', 42_000)],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Полипропилен'),
      createAttribute('reinforced', 'Армирование', true),
    ],
    categoryId: CATEGORY_IDS.polypropylenePipes,
    id: 'product-003',
    name: 'Труба полипропиленовая армированная',
    slug: 'truba-polipropilenovaya-armirovannaya',
    variants: [
      createVariantSeed('20', 'Диаметр 20 мм', 21_500, [createOption('diameter', '20 мм', '20')]),
      createVariantSeed('25', 'Диаметр 25 мм', 29_900, [createOption('diameter', '25 мм', '25')]),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Сталь'),
      createAttribute('wall', 'Толщина стенки', 3.5, 'мм'),
    ],
    categoryId: CATEGORY_IDS.metalPipes,
    id: 'product-004',
    name: 'Труба стальная электросварная',
    slug: 'truba-stalnaya-elektrosvarnaya',
    variants: [
      createVariantSeed('57', 'Диаметр 57 мм', 53_000, [], {
        minOrderQuantity: '0.5',
        quantityStep: '0.5',
        unitCode: 'meter',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПНД'),
      createAttribute('diameter', 'Диаметр', 25, 'мм'),
    ],
    categoryId: CATEGORY_IDS.couplings,
    id: 'product-005',
    name: 'Муфта ПНД компрессионная',
    slug: 'mufta-pnd-kompressionnaya',
    variants: [createVariantSeed('25', 'Диаметр 25 мм', 13_500)],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПНД'),
      createAttribute('angle', 'Угол', 90, '°'),
    ],
    categoryId: CATEGORY_IDS.elbows,
    id: 'product-006',
    name: 'Угольник ПНД 90°',
    slug: 'ugolnik-pnd-90',
    variants: [createVariantSeed('32', 'Диаметр 32 мм', 29_000)],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Полипропилен'),
      createAttribute('application', 'Назначение', 'Отопление'),
    ],
    categoryId: CATEGORY_IDS.tees,
    id: 'product-007',
    name: 'Тройник полипропиленовый комбинированный',
    slug: 'troynik-polipropilenovyy-kombinirovannyy',
    variants: [
      createVariantSeed('20-pn20', '20 мм, PN20', 18_000, [
        createOption('diameter', '20 мм', '20'),
        createOption('pressure', 'PN20', 'pn20'),
      ]),
      createVariantSeed('20-pn25', '20 мм, PN25', 21_000, [
        createOption('diameter', '20 мм', '20'),
        createOption('pressure', 'PN25', 'pn25'),
      ]),
      createVariantSeed('25-pn20', '25 мм, PN20', 25_000, [
        createOption('diameter', '25 мм', '25'),
        createOption('pressure', 'PN20', 'pn20'),
      ]),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПВХ'),
      createAttribute('diameter', 'Диаметр', 50, 'мм'),
    ],
    categoryId: CATEGORY_IDS.adapters,
    id: 'product-008',
    imageCount: 0,
    name: 'Переходник ПВХ 50 × 40 мм',
    slug: 'perehodnik-pvh-50-40',
    variants: [createVariantSeed('50-40', '50 × 40 мм', 9_900)],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПНД'),
      createAttribute('diameter', 'Диаметр', 32, 'мм'),
    ],
    categoryId: CATEGORY_IDS.caps,
    id: 'product-009',
    imageCount: 3,
    name: 'Заглушка ПНД компрессионная',
    slug: 'zaglushka-pnd-kompressionnaya',
    variants: [createVariantSeed('32', 'Диаметр 32 мм', 11_500)],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'EPDM'),
      createAttribute('color', 'Цвет', 'Чёрный'),
    ],
    categoryId: CATEGORY_IDS.seals,
    id: 'product-010',
    name: 'Уплотнитель дверной резиновый',
    slug: 'uplotnitel-dvernoj-rezinovyj',
    variants: [
      createVariantSeed('black', 'Чёрный', 7_500, [], {
        availabilityStatus: 'out_of_stock',
        unitCode: 'meter',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Резина'),
      createAttribute('diameter', 'Диаметр', 110, 'мм'),
    ],
    categoryId: CATEGORY_IDS.manzhets,
    id: 'product-011',
    name: 'Манжета резиновая переходная',
    slug: 'manzheta-rezinovaya-perehodnaya',
    variants: [
      createVariantSeed('110-123', '110 × 123 мм', 35_000, [], {
        availabilityStatus: 'on_order',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Паронит'),
      createAttribute('thickness', 'Толщина', 2, 'мм'),
    ],
    badges: ['Скидка'],
    categoryId: CATEGORY_IDS.gaskets,
    id: 'product-012',
    name: 'Прокладка паронитовая фланцевая',
    slug: 'prokladka-paronitovaya-flancevaya',
    variants: [
      createVariantSeed('dn50', 'DN50', 9_500, [], {
        oldPriceMinor: 11_500,
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПВХ'),
      createAttribute('diameter', 'Диаметр', 18, 'мм'),
    ],
    categoryId: CATEGORY_IDS.hoses,
    id: 'product-013',
    name: 'Шланг поливочный армированный',
    slug: 'shlang-polivochnyj-armirovannyy',
    variants: [
      createVariantSeed('18', 'Диаметр 18 мм', 12_000, [], {
        priceType: 'from',
        unitCode: 'meter',
      }),
      createVariantSeed('25', 'Диаметр 25 мм', 18_000, [], {
        priceType: 'from',
        unitCode: 'meter',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Бутилкаучук'),
      createAttribute('volume', 'Объём', 80, 'л'),
    ],
    categoryId: CATEGORY_IDS.chambers,
    id: 'product-014',
    name: 'Камера резиновая промышленная',
    slug: 'kamera-rezinovaya-promyshlennaya',
    variants: [
      createVariantSeed('80l', 'Объём 80 л', null, [], {
        availabilityStatus: 'unknown',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Фторопласт'),
      createAttribute('width', 'Ширина', 19, 'мм'),
    ],
    categoryId: CATEGORY_IDS.related,
    id: 'product-015',
    name: 'Лента ФУМ профессиональная',
    slug: 'lenta-fum-professionalnaya',
    variants: [
      createVariantSeed('roll', 'Рулон 15 м', 7_900, [], {
        unitCode: 'roll',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Нержавеющая сталь'),
      createAttribute('diameter', 'Диаметр', '20–32', 'мм'),
    ],
    categoryId: CATEGORY_IDS.related,
    id: 'product-016',
    name: 'Хомут червячный нержавеющий',
    slug: 'homut-chervyachnyj-nerzhaveyushchij',
    variants: [
      createVariantSeed('20-32', '20–32 мм', 6_500, [], {
        packageQuantity: '10',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Основа', 'Силикон'),
      createAttribute('color', 'Цвет', 'Прозрачный'),
    ],
    categoryId: CATEGORY_IDS.related,
    id: 'product-017',
    name: 'Герметик силиконовый нейтральный',
    slug: 'germetik-silikonovyj-nejtralnyj',
    variants: [createVariantSeed('transparent', 'Прозрачный, 280 мл', 34_900)],
  },
  {
    attributes: [
      createAttribute('application', 'Назначение', 'Полимерные трубы'),
      createAttribute('maxDiameter', 'Максимальный диаметр', 42, 'мм'),
    ],
    categoryId: CATEGORY_IDS.related,
    id: 'product-018',
    name: 'Ножницы для полимерных труб',
    slug: 'nozhnicy-dlya-polimernyh-trub',
    variants: [createVariantSeed('42', 'До 42 мм', 129_000)],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Техническая резина'),
      createAttribute('thickness', 'Толщина', 3, 'мм'),
    ],
    categoryId: CATEGORY_IDS.rubber,
    id: 'product-019',
    name: 'Рулон технической резины',
    slug: 'rulon-tehnicheskoj-reziny',
    variants: [
      createVariantSeed('3mm', 'Толщина 3 мм', 49_000, [], {
        minOrderQuantity: '0.5',
        quantityStep: '0.5',
        unitCode: 'kilogram',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'Оцинкованная сталь'),
      createAttribute('items', 'Количество элементов', 12),
    ],
    categoryId: CATEGORY_IDS.related,
    id: 'product-020',
    name: 'Комплект креплений для труб',
    slug: 'komplekt-kreplenij-dlya-trub',
    variants: [
      createVariantSeed('set', 'Комплект 12 элементов', 46_000, [], {
        unitCode: 'set',
      }),
    ],
  },
  {
    attributes: [
      createAttribute('material', 'Материал', 'ПВХ'),
      createAttribute('diameter', 'Диаметр', 32, 'мм'),
    ],
    categoryId: CATEGORY_IDS.adapters,
    id: 'product-021',
    name: 'Переходник архивный',
    slug: ARCHIVED_PRODUCT_SLUG,
    variants: [createVariantSeed('32-25', '32 × 25 мм', 8_500)],
    visibility: 'archived',
  },
];

export const productFixtures: readonly ProductFixture[] = productSeeds.map(createProductFixture);

export const storefrontProductFixtures: readonly ProductFixture[] = productFixtures.filter(
  (fixture) => fixture.visibility === 'active',
);
