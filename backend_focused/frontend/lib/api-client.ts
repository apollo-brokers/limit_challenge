import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  redirectToLogin,
  setTokens,
} from '@/lib/auth';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

/** Client for application endpoints: adds the Bearer token and renews it on 401. */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
});

/** Client for the token endpoints. It has no interceptors, so auth calls never trigger a refresh. */
export const authClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000,
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshInFlight: Promise<string> | null = null;

/** Get a new access token. Parallel callers share one refresh request. */
function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    const refresh = getRefreshToken();
    const request = refresh
      ? authClient
          .post<{ access: string; refresh?: string }>('/v1/auth/token/refresh/', { refresh })
          .then(({ data }) => {
            setTokens(data);
            return data.access;
          })
      : Promise.reject(new Error('No refresh token stored.'));
    refreshInFlight = request.finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

function endSession(error: AxiosError): Promise<never> {
  clearTokens();
  redirectToLogin();
  return Promise.reject(error);
}

/**
 * On a 401, refresh the access token once and retry the request once.
 *
 * If the refresh fails, or the retried request is rejected with 401 again, the session cannot be
 * used any more: the tokens are cleared and the browser goes to the login page.
 */
apiClient.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  if (error.response?.status !== 401 || !config) {
    return Promise.reject(error);
  }
  if (config._retried) return endSession(error);
  config._retried = true;
  try {
    await refreshAccessToken();
  } catch {
    return endSession(error);
  }
  // The request interceptor adds the new token on the retry.
  return apiClient(config);
});
