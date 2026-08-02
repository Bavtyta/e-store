import { apiClient, mapApiError, parseApiResponse } from '@/shared/api';

import type { ResolveVariantsRequest, ResolveVariantsResponse } from './productApiContracts';
import { mapResolveVariantsResponseDto } from './productApiContracts';

const RESOLVE_VARIANTS_PATH = '/catalog/variants/resolve';

export async function resolveProductVariants(
  request: ResolveVariantsRequest,
  signal?: AbortSignal,
): Promise<ResolveVariantsResponse> {
  try {
    const response = await apiClient.post<unknown>(RESOLVE_VARIANTS_PATH, request, {
      ...(signal === undefined ? {} : { signal }),
    });

    return parseApiResponse(response.data, mapResolveVariantsResponseDto);
  } catch (error) {
    throw mapApiError(error);
  }
}
