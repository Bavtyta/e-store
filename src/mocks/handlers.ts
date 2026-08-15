import { delay, http, HttpResponse } from 'msw';

import {
  productListResponseSchema,
  productSortSchema,
  resolveVariantsRequestSchema,
  resolveVariantsResponseSchema,
} from '@/entities/product';
import type {
  CartResolvedVariant,
  ProductListResponse,
  ProductSort,
  ResolveVariantsResponse,
} from '@/entities/product';
import type { ApiErrorEnvelope } from '@/shared/api';

import {
  categoryFixtures,
  findCategoryFixture,
  getCategoryFixtureIds,
  storefrontProductFixtures,
} from './data';
import { getMockScenario } from './scenarios';
import type { MockScenario } from './scenarios';

const API_BASE_PATH = '/api/v1';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MOCK_DELAY_MS = 600;
const IMAGE_THEMES = [
  {
    accent: '#d97706',
    background: '#fff7ed',
    foreground: '#7c2d12',
  },
  {
    accent: '#2563eb',
    background: '#eff6ff',
    foreground: '#1e3a8a',
  },
  {
    accent: '#059669',
    background: '#ecfdf5',
    foreground: '#064e3b',
  },
] as const;

interface ParsedPagination {
  limit: number;
  page: number;
}

type PaginationParseResult =
  | {
      data: ParsedPagination;
      success: true;
    }
  | {
      success: false;
    };

function createErrorResponse(
  status: 400 | 404 | 409 | 422 | 500,
  code: string,
  message: string,
): Response {
  const body: ApiErrorEnvelope = {
    error: {
      code,
      details: null,
      message,
      requestId: null,
    },
  };

  return HttpResponse.json(body, { status });
}

async function handleCommonScenario(scenario: MockScenario): Promise<Response | null> {
  switch (scenario) {
    case 'delay':
      await delay(MOCK_DELAY_MS);
      return null;
    case 'server-error':
      return createErrorResponse(500, 'INTERNAL_ERROR', 'Внутренняя ошибка сервера.');
    case 'network-error':
      return HttpResponse.error();
    case 'invalid-response':
      return HttpResponse.json({
        invalid: true,
      });
    case 'changed-availability':
    case 'changed-price':
    case 'conflict':
    case 'empty':
    case 'success':
      return null;
  }
}

function parsePositiveInteger(value: string | null, fallback: number): number | null {
  if (value === null) {
    return fallback;
  }

  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function parsePagination(searchParams: URLSearchParams): PaginationParseResult {
  const page = parsePositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
  const limit = parsePositiveInteger(searchParams.get('limit'), DEFAULT_LIMIT);

  if (page === null || limit === null) {
    return {
      success: false,
    };
  }

  return {
    data: {
      limit,
      page,
    },
    success: true,
  };
}

function parseSort(searchParams: URLSearchParams): ProductSort | null {
  const result = productSortSchema.safeParse(searchParams.get('sort') ?? 'relevance');

  return result.success ? result.data : null;
}

function parseFilters(searchParams: URLSearchParams): Map<string, string> | null {
  const filters = new Map<string, string>();

  for (const [key, value] of searchParams.entries()) {
    const match = /^filter\[([^\]]+)\]$/.exec(key);

    if (match === null) {
      continue;
    }

    const attributeCode = match[1];

    if (attributeCode === undefined || attributeCode.trim().length === 0) {
      return null;
    }

    filters.set(attributeCode, value);
  }

  return filters;
}

function parsePriceParam(searchParams: URLSearchParams, name: string): number | null {
  const value = searchParams.get(name);

  if (value === null) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : null;
}

function parsePriceRange(searchParams: URLSearchParams): { min: number | null; max: number | null } {
  return {
    min: parsePriceParam(searchParams, 'price_min'),
    max: parsePriceParam(searchParams, 'price_max'),
  };
}

function normalizeText(value: string | number | boolean): string {
  return String(value).trim().toLocaleLowerCase('ru-RU');
}

function matchesSearch(
  fixture: (typeof storefrontProductFixtures)[number],
  search: string,
): boolean {
  const normalizedSearch = normalizeText(search);

  if (normalizedSearch.length === 0) {
    return true;
  }

  const searchableValues: (string | number | boolean)[] = [
    fixture.listItem.name,
    fixture.listItem.slug,
    ...fixture.details.attributes.map((attribute) => attribute.value),
    ...fixture.details.variants.flatMap((variant) =>
      variant.attributes.map((attribute) => attribute.value),
    ),
  ];

  return searchableValues.some((value) => normalizeText(value).includes(normalizedSearch));
}

function matchesFilters(
  fixture: (typeof storefrontProductFixtures)[number],
  filters: ReadonlyMap<string, string>,
): boolean {
  const attributes = [
    ...fixture.details.attributes,
    ...fixture.details.variants.flatMap((variant) => variant.attributes),
  ];
  const normalizedAttributes = attributes.map((attribute) => ({
    code: attribute.code,
    value: normalizeText(attribute.value),
  }));

  return [...filters.entries()].every(([code, rawValue]) => {
    const expectedValues = rawValue
      .split(',')
      .map((value) => normalizeText(value))
      .filter((value) => value.length > 0);

    return (
      expectedValues.length > 0 &&
      expectedValues.some((expectedValue) =>
        normalizedAttributes.some(
          (attribute) => attribute.code === code && attribute.value === expectedValue,
        ),
      )
    );
  });
}

function matchesPriceRange(
  fixture: (typeof storefrontProductFixtures)[number],
  priceRange: { min: number | null; max: number | null },
): boolean {
  if (priceRange.min === null && priceRange.max === null) {
    return true;
  }

  const priceFromMinor = fixture.listItem.priceFrom?.amountMinor ?? null;

  if (priceFromMinor === null) {
    return false;
  }

  const minimumMinor = priceRange.min === null ? null : priceRange.min * 100;
  const maximumMinor = priceRange.max === null ? null : priceRange.max * 100;

  return (
    (minimumMinor === null || priceFromMinor >= minimumMinor) &&
    (maximumMinor === null || priceFromMinor <= maximumMinor)
  );
}

function compareNullablePrices(
  first: (typeof storefrontProductFixtures)[number],
  second: (typeof storefrontProductFixtures)[number],
  direction: 'ascending' | 'descending',
): number {
  const firstPrice = first.listItem.priceFrom?.amountMinor;
  const secondPrice = second.listItem.priceFrom?.amountMinor;

  if (firstPrice === undefined && secondPrice === undefined) {
    return 0;
  }

  if (firstPrice === undefined) {
    return 1;
  }

  if (secondPrice === undefined) {
    return -1;
  }

  return direction === 'ascending' ? firstPrice - secondPrice : secondPrice - firstPrice;
}

function sortProductFixtures(
  fixtures: readonly (typeof storefrontProductFixtures)[number][],
  sort: ProductSort,
) {
  const sortedFixtures = [...fixtures];

  switch (sort) {
    case 'price_asc':
      return sortedFixtures.sort((first, second) =>
        compareNullablePrices(first, second, 'ascending'),
      );
    case 'price_desc':
      return sortedFixtures.sort((first, second) =>
        compareNullablePrices(first, second, 'descending'),
      );
    case 'name_asc':
      return sortedFixtures.sort((first, second) =>
        first.listItem.name.localeCompare(second.listItem.name, 'ru-RU'),
      );
    case 'name_desc':
      return sortedFixtures.sort((first, second) =>
        second.listItem.name.localeCompare(first.listItem.name, 'ru-RU'),
      );
    case 'relevance':
      return sortedFixtures;
  }
}

function getPathParameter(value: string | readonly string[] | undefined): string {
  return typeof value === 'string' ? value : '';
}

function createProductImageFixture(fileName: string): string {
  const parsedImageNumber = Number(/-(\d+)\.webp$/.exec(fileName)?.[1] ?? '1');
  const imageNumber =
    Number.isInteger(parsedImageNumber) && parsedImageNumber > 0 ? parsedImageNumber : 1;
  const theme = IMAGE_THEMES[(imageNumber - 1) % IMAGE_THEMES.length] ?? IMAGE_THEMES[0];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 800">
  <rect width="1000" height="800" fill="${theme.background}"/>
  <circle cx="790" cy="150" r="210" fill="${theme.accent}" opacity=".12"/>
  <circle cx="180" cy="700" r="260" fill="${theme.accent}" opacity=".1"/>
  <g fill="none" stroke="${theme.foreground}" stroke-linecap="round" stroke-width="34">
    <path d="M180 510h430c92 0 166-74 166-166V220"/>
    <path d="M180 610h430c147 0 266-119 266-266V220" opacity=".45"/>
  </g>
  <rect x="122" y="438" width="160" height="244" rx="28" fill="${theme.accent}"/>
  <text x="500" y="118" fill="${theme.foreground}" font-family="Arial, sans-serif"
    font-size="44" font-weight="700" text-anchor="middle">DEMO ${String(imageNumber).padStart(2, '0')}</text>
</svg>`;
}

function findStorefrontVariant(variantId: string): CartResolvedVariant | undefined {
  for (const fixture of storefrontProductFixtures) {
    const variant = fixture.details.variants.find((item) => item.id === variantId);

    if (variant !== undefined) {
      return {
        product: {
          id: fixture.details.id,
          image:
            fixture.details.images.find((image) => image.id === variant.imageId) ??
            fixture.details.images[0] ??
            null,
          name: fixture.details.name,
          slug: fixture.details.slug,
        },
        variant,
      };
    }
  }

  return undefined;
}

function applyResolveScenario(
  resolvedVariant: CartResolvedVariant,
  scenario: MockScenario,
): CartResolvedVariant {
  const { variant } = resolvedVariant;

  if (scenario === 'changed-price' && variant.price !== null) {
    return {
      ...resolvedVariant,
      variant: {
        ...variant,
        oldPrice: variant.price,
        price: {
          ...variant.price,
          amountMinor: variant.price.amountMinor + 500,
        },
      },
    };
  }

  if (scenario === 'changed-availability') {
    return {
      ...resolvedVariant,
      variant: {
        ...variant,
        availability: {
          message: 'Нет в наличии',
          status: 'out_of_stock',
        },
        availableQuantity: null,
      },
    };
  }

  return resolvedVariant;
}

const categoryHandlers = [
  http.get(`${API_BASE_PATH}/catalog/categories`, async ({ request }) => {
    const scenario = getMockScenario(request);
    const earlyResponse = await handleCommonScenario(scenario);

    if (earlyResponse !== null) {
      return earlyResponse;
    }

    return HttpResponse.json(scenario === 'empty' ? [] : categoryFixtures);
  }),

  http.get(`${API_BASE_PATH}/catalog/categories/:categoryPath`, async ({ params, request }) => {
    const scenario = getMockScenario(request);
    const earlyResponse = await handleCommonScenario(scenario);

    if (earlyResponse !== null) {
      return earlyResponse;
    }

    const category = findCategoryFixture(getPathParameter(params.categoryPath));

    if (category === undefined) {
      return createErrorResponse(404, 'CATEGORY_NOT_FOUND', 'Категория не найдена.');
    }

    return HttpResponse.json(category);
  }),
];

const productHandlers = [
  http.get(`${API_BASE_PATH}/catalog/products`, async ({ request }) => {
    const scenario = getMockScenario(request);
    const earlyResponse = await handleCommonScenario(scenario);

    if (earlyResponse !== null) {
      return earlyResponse;
    }

    const url = new URL(request.url);
    const pagination = parsePagination(url.searchParams);
    const sort = parseSort(url.searchParams);
    const filters = parseFilters(url.searchParams);

    if (!pagination.success || sort === null || filters === null) {
      return createErrorResponse(
        400,
        'INVALID_PRODUCT_QUERY',
        'Некорректные параметры списка товаров.',
      );
    }

    const categoryIdentifier = url.searchParams.get('category');
    const categoryIds =
      categoryIdentifier === null ? null : getCategoryFixtureIds(categoryIdentifier);

    if (categoryIds !== null && categoryIds.size === 0) {
      return createErrorResponse(400, 'INVALID_CATEGORY', 'Неизвестная категория.');
    }

    const search = url.searchParams.get('search') ?? '';
    const priceRange = parsePriceRange(url.searchParams);
    const filteredFixtures =
      scenario === 'empty'
        ? []
        : storefrontProductFixtures.filter(
            (fixture) =>
              (categoryIds === null || categoryIds.has(fixture.listItem.categoryId)) &&
              matchesSearch(fixture, search) &&
              matchesFilters(fixture, filters) &&
              matchesPriceRange(fixture, priceRange),
          );
    const sortedFixtures = sortProductFixtures(filteredFixtures, sort);
    const startIndex = (pagination.data.page - 1) * pagination.data.limit;
    const total = sortedFixtures.length;
    const response: ProductListResponse = {
      items: sortedFixtures
        .slice(startIndex, startIndex + pagination.data.limit)
        .map((fixture) => fixture.listItem),
      pagination: {
        limit: pagination.data.limit,
        page: pagination.data.page,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pagination.data.limit),
      },
    };

    return HttpResponse.json(productListResponseSchema.parse(response));
  }),

  http.get(`${API_BASE_PATH}/catalog/products/:slug`, async ({ params, request }) => {
    const scenario = getMockScenario(request);
    const earlyResponse = await handleCommonScenario(scenario);

    if (earlyResponse !== null) {
      return earlyResponse;
    }

    const slug = getPathParameter(params.slug);
    const fixture = storefrontProductFixtures.find((candidate) => candidate.details.slug === slug);

    if (fixture === undefined) {
      return createErrorResponse(404, 'PRODUCT_NOT_FOUND', 'Товар не найден.');
    }

    return HttpResponse.json(fixture.details);
  }),
];

const variantHandlers = [
  http.post(`${API_BASE_PATH}/catalog/variants/resolve`, async ({ request }) => {
    const scenario = getMockScenario(request);
    const earlyResponse = await handleCommonScenario(scenario);

    if (earlyResponse !== null) {
      return earlyResponse;
    }

    if (scenario === 'conflict') {
      return createErrorResponse(409, 'STATE_CONFLICT', 'Состояние данных изменилось.');
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, 'INVALID_JSON', 'Некорректный JSON.');
    }

    const requestResult = resolveVariantsRequestSchema.safeParse(body);

    if (!requestResult.success) {
      return createErrorResponse(
        422,
        'VALIDATION_FAILED',
        'Не удалось проверить идентификаторы вариантов.',
      );
    }

    const response: ResolveVariantsResponse = {
      items: [],
      missingVariantIds: [],
    };

    for (const variantId of requestResult.data.variantIds) {
      const variant = findStorefrontVariant(variantId);

      if (variant === undefined) {
        response.missingVariantIds.push(variantId);
      } else {
        response.items.push(applyResolveScenario(variant, scenario));
      }
    }

    return HttpResponse.json(resolveVariantsResponseSchema.parse(response));
  }),
];

const imageHandlers = [
  http.get('/fixtures/products/:fileName', ({ params }) => {
    const fileName = getPathParameter(params.fileName);

    return new HttpResponse(createProductImageFixture(fileName), {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'image/svg+xml; charset=utf-8',
      },
    });
  }),
];

export const handlers = [
  ...imageHandlers,
  ...categoryHandlers,
  ...productHandlers,
  ...variantHandlers,
];
