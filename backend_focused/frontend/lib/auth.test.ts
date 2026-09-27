import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, authClient } from '@/lib/api-client';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  loginPath,
  redirectToLogin,
  safeNextPath,
  setTokens,
} from '@/lib/auth';
import { httpError, okResponse } from '@/test/http';

vi.mock('@/lib/auth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/auth')>()),
  redirectToLogin: vi.fn(),
}));

type Adapter = (config: InternalAxiosRequestConfig) => Promise<AxiosResponse>;

const apiAdapter = vi.fn<Adapter>();
const authAdapter = vi.fn<Adapter>();

function bearer(config: InternalAxiosRequestConfig) {
  return config.headers.get('Authorization');
}

beforeEach(() => {
  apiAdapter.mockReset();
  authAdapter.mockReset();
  vi.mocked(redirectToLogin).mockReset();
  apiClient.defaults.adapter = apiAdapter;
  authClient.defaults.adapter = authAdapter;
  setTokens({ access: 'old-access', refresh: 'refresh-1' });
});

describe('request interceptor', () => {
  it('sends the stored access token as a Bearer header', async () => {
    apiAdapter.mockImplementation(async (config) => okResponse(config, {}));

    await apiClient.get('/v1/vehicles/');

    expect(bearer(apiAdapter.mock.calls[0][0])).toBe('Bearer old-access');
  });

  it('sends no Authorization header without a token', async () => {
    clearTokens();
    apiAdapter.mockImplementation(async (config) => okResponse(config, {}));

    await apiClient.get('/v1/vehicles/');

    expect(bearer(apiAdapter.mock.calls[0][0])).toBeFalsy();
  });
});

describe('refresh on 401', () => {
  it('refreshes once for parallel 401s and retries each request with the new token', async () => {
    apiAdapter.mockImplementation(async (config) =>
      bearer(config) === 'Bearer new-access'
        ? okResponse(config, { url: config.url })
        : Promise.reject(httpError(401, { detail: 'Token expired' }, config)),
    );
    let releaseRefresh!: () => void;
    const refreshGate = new Promise<void>((resolve) => (releaseRefresh = resolve));
    authAdapter.mockImplementation(async (config) => {
      await refreshGate;
      return okResponse(config, { access: 'new-access' });
    });

    const requests = Promise.all([apiClient.get('/v1/vehicles/'), apiClient.get('/v1/offices/')]);
    await vi.waitFor(() => expect(apiAdapter).toHaveBeenCalledTimes(2));
    releaseRefresh();
    const [vehicles, offices] = await requests;

    expect(vehicles.data).toEqual({ url: '/v1/vehicles/' });
    expect(offices.data).toEqual({ url: '/v1/offices/' });
    expect(authAdapter).toHaveBeenCalledTimes(1);
    expect(authAdapter.mock.calls[0][0].url).toBe('/v1/auth/token/refresh/');
    expect(JSON.parse(authAdapter.mock.calls[0][0].data)).toEqual({ refresh: 'refresh-1' });
    expect(getAccessToken()).toBe('new-access');
    expect(getRefreshToken()).toBe('refresh-1');
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('stores a new refresh token when the API returns one', async () => {
    apiAdapter.mockImplementation(async (config) =>
      bearer(config) === 'Bearer new-access'
        ? okResponse(config, {})
        : Promise.reject(httpError(401, {}, config)),
    );
    authAdapter.mockImplementation(async (config) =>
      okResponse(config, { access: 'new-access', refresh: 'refresh-2' }),
    );

    await apiClient.get('/v1/vehicles/');

    expect(getRefreshToken()).toBe('refresh-2');
  });

  it('ends the session when the retried request is also rejected with 401', async () => {
    apiAdapter.mockImplementation(async (config) => Promise.reject(httpError(401, {}, config)));
    authAdapter.mockImplementation(async (config) => okResponse(config, { access: 'new-access' }));

    await expect(apiClient.get('/v1/vehicles/')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(apiAdapter).toHaveBeenCalledTimes(2);
    expect(authAdapter).toHaveBeenCalledTimes(1);
    expect(bearer(apiAdapter.mock.calls[1][0])).toBe('Bearer new-access');
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('clears tokens and redirects to login when the refresh fails', async () => {
    apiAdapter.mockImplementation(async (config) => Promise.reject(httpError(401, {}, config)));
    authAdapter.mockImplementation(async (config) =>
      Promise.reject(httpError(401, { detail: 'Token is invalid' }, config)),
    );

    await expect(apiClient.get('/v1/vehicles/')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('redirects without calling refresh when there is no refresh token', async () => {
    clearTokens();
    apiAdapter.mockImplementation(async (config) => Promise.reject(httpError(401, {}, config)));

    await expect(apiClient.get('/v1/vehicles/')).rejects.toBeDefined();

    expect(authAdapter).not.toHaveBeenCalled();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
  });

  it('leaves other errors alone', async () => {
    apiAdapter.mockImplementation(async (config) => Promise.reject(httpError(500, {}, config)));

    await expect(apiClient.get('/v1/vehicles/')).rejects.toMatchObject({
      response: { status: 500 },
    });

    expect(authAdapter).not.toHaveBeenCalled();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });
});

describe('login redirects', () => {
  it('accepts app-internal paths', () => {
    expect(safeNextPath('/vehicles?office=1&page=2')).toBe('/vehicles?office=1&page=2');
    expect(safeNextPath('/vehicles/3/edit')).toBe('/vehicles/3/edit');
  });

  it.each([
    null,
    '',
    'vehicles',
    '//evil.com',
    '/\\evil.com',
    'https://evil.com',
    'javascript:alert(1)',
  ])('falls back to /vehicles for %j', (next) => {
    expect(safeNextPath(next)).toBe('/vehicles');
  });

  it('encodes the next path in the login URL', () => {
    const path = loginPath('/vehicles?office=1&page=2');

    expect(path).toBe('/login?next=%2Fvehicles%3Foffice%3D1%26page%3D2');
    expect(safeNextPath(new URLSearchParams(path.split('?')[1]).get('next'))).toBe(
      '/vehicles?office=1&page=2',
    );
  });
});
