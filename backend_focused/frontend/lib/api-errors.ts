import { isAxiosError } from 'axios';

export type ApiErrorInfo = {
  message: string | null;
  fieldErrors: Record<string, string>;
};

const NETWORK_MESSAGE = 'Cannot reach the API. Check that the backend is running.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

/** Return the HTTP status of a failed axios request, or undefined when there was no response. */
export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

function toText(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const text = value.filter((item) => typeof item === 'string').join(' ');
    return text || null;
  }
  return null;
}

/**
 * Turn an API error into a general message and per-field messages.
 *
 * `fields` maps API field names to form field names (for example `office_id` to `office`).
 * On a 400, mapped fields go to `fieldErrors`. `non_field_errors`, `detail` and unmapped fields
 * go to `message`. Other statuses use the `detail` text when there is one.
 */
export function parseApiError(error: unknown, fields: Record<string, string> = {}): ApiErrorInfo {
  if (!error) return { message: null, fieldErrors: {} };
  if (!isAxiosError(error)) return { message: GENERIC_MESSAGE, fieldErrors: {} };
  if (!error.response) return { message: NETWORK_MESSAGE, fieldErrors: {} };

  const { status, data } = error.response;

  if (status === 400) {
    if (Array.isArray(data)) {
      return { message: toText(data) ?? 'The request is invalid.', fieldErrors: {} };
    }
    const fieldErrors: Record<string, string> = {};
    const general: string[] = [];
    if (data && typeof data === 'object') {
      for (const [key, value] of Object.entries(data)) {
        const text = toText(value);
        if (!text) continue;
        const field = fields[key];
        if (field) fieldErrors[field] = text;
        else if (key === 'non_field_errors' || key === 'detail') general.push(text);
        else general.push(`${key}: ${text}`);
      }
    }
    if (general.length === 0 && Object.keys(fieldErrors).length === 0) {
      return { message: 'The request is invalid.', fieldErrors };
    }
    return { message: general.length ? general.join(' ') : null, fieldErrors };
  }

  const detail =
    data && typeof data === 'object' ? toText((data as { detail?: unknown }).detail) : null;
  if (detail) return { message: detail, fieldErrors: {} };
  if (status >= 500)
    return { message: `The server returned an error (${status}).`, fieldErrors: {} };
  return { message: GENERIC_MESSAGE, fieldErrors: {} };
}
