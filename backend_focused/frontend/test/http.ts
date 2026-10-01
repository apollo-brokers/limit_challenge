import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

/** Build a successful axios response for a fake adapter. */
export function okResponse<T>(config: InternalAxiosRequestConfig, data: T): AxiosResponse<T> {
  return { status: 200, statusText: 'OK', data, headers: {}, config };
}

/** Build the AxiosError that axios raises for a non-2xx response. */
export function httpError(
  status: number,
  data: unknown,
  config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() },
): AxiosError {
  const response = { status, statusText: '', data, headers: {}, config } as AxiosResponse;
  return new AxiosError(
    `Request failed with status code ${status}`,
    status < 500 ? AxiosError.ERR_BAD_REQUEST : AxiosError.ERR_BAD_RESPONSE,
    config,
    null,
    response,
  );
}
