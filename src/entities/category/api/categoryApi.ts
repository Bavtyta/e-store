import { apiClient, mapApiError, parseApiResponse } from '@/shared/api';

import type { Category } from '../model/category';
import { mapCategoryDto } from '../model/mapCategoryDto';
import { mapCategoryListDto } from './categoryContracts';

const CATEGORY_PATH = '/catalog/categories';

function createRequestConfig(signal: AbortSignal | undefined) {
  return signal === undefined ? {} : { signal };
}

export async function getCategories(signal?: AbortSignal): Promise<Category[]> {
  try {
    const response = await apiClient.get<unknown>(CATEGORY_PATH, createRequestConfig(signal));

    return parseApiResponse(response.data, mapCategoryListDto);
  } catch (error) {
    throw mapApiError(error);
  }
}

export async function getCategory(categoryPath: string, signal?: AbortSignal): Promise<Category> {
  try {
    const response = await apiClient.get<unknown>(
      `${CATEGORY_PATH}/${encodeURIComponent(categoryPath)}`,
      createRequestConfig(signal),
    );

    return parseApiResponse(response.data, mapCategoryDto);
  } catch (error) {
    throw mapApiError(error);
  }
}
