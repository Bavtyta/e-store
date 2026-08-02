import axios from 'axios';

import { appConfig } from '@/shared/config';

import { mapApiError } from './mapApiError';

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    Accept: 'application/json',
  },
  timeout: 10_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(mapApiError(error)),
);
