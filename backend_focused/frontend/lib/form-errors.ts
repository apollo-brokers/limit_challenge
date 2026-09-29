import { isAxiosError } from 'axios';
import { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

function messages(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(messages);
  return [];
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<unknown>(error)) {
    if (!error.response) return 'Could not reach the API. Check your connection and try again.';
    const data = error.response.data;
    if (data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string')
      return data.detail;
    if (error.response.status === 400) return 'Check the highlighted fields and try again.';
    if (error.response.status === 404) return 'This record or page could not be found.';
    if (error.response.status === 409)
      return 'This record is still used by other records and cannot be deleted.';
  }
  return 'Something went wrong. Please try again.';
}

export function applyFormErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: FieldPath<T>[],
) {
  const data = isAxiosError<unknown>(error) ? error.response?.data : undefined;
  let hasFieldError = false;
  const generalErrors: string[] = [];
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      const text = messages(value).join(' ');
      if (!text) continue;
      const field = knownFields.find((name) => name === key);
      if (field) {
        setError(field, { type: 'server', message: text }, { shouldFocus: !hasFieldError });
        hasFieldError = true;
      } else generalErrors.push(text);
    }
  }
  if (generalErrors.length || !hasFieldError)
    setError('root.server', {
      type: 'server',
      message: generalErrors.join(' ') || getErrorMessage(error),
    });
}
