import { apiClient, mapApiError, parseApiResponse } from '@/shared/api';

import type { ProductDetails } from '../model/product';
import { mapProductDetailsDto } from '../model/mapProductDto';
import type { ProductListParams, ProductListResponse } from './productApiContracts';
import { mapProductListResponseDto } from './productApiContracts';

const PRODUCT_PATH = '/catalog/products';

function createProductListQuery(params: ProductListParams): Record<string, number | string> {
  const query: Record<string, number | string> = {};

  if (params.category !== undefined) {
    query.category = params.category;
  }

  if (params.search !== undefined) {
    query.search = params.search;
  }

  if (params.sort !== undefined) {
    query.sort = params.sort;
  }

  if (params.page !== undefined) {
    query.page = params.page;
  }

  if (params.limit !== undefined) {
    query.limit = params.limit;
  }

  if (params.filters !== undefined) {
    for (const [attributeCode, value] of Object.entries(params.filters)) {
      query[`filter[${attributeCode}]`] = value;
    }
  }

  return query;
}

export async function getProducts(
  params: ProductListParams = {},
  signal?: AbortSignal,
): Promise<ProductListResponse> {
  try {
    const response = await apiClient.get<unknown>(PRODUCT_PATH, {
      params: createProductListQuery(params),
      ...(signal === undefined ? {} : { signal }),
    });

    return parseApiResponse(response.data, mapProductListResponseDto);
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function getProduct(slug: string, signal?: AbortSignal): Promise<ProductDetails> {
  try {
    const response = await apiClient.get<unknown>(
      `${PRODUCT_PATH}/${encodeURIComponent(slug)}`,
      signal === undefined ? {} : { signal },
    );

    return parseApiResponse(response.data, mapProductDetailsDto);
  } catch (error) {
    throw mapApiError(error);
  }
}
