import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { getErrorStatus, parseApiError } from '@/lib/api-errors';
import { httpError } from '@/test/http';

const VEHICLE_FIELDS = { vin: 'vin', license_plate: 'license_plate', office_id: 'office' };

describe('parseApiError', () => {
  it('returns nothing for a missing error', () => {
    expect(parseApiError(null)).toEqual({ message: null, fieldErrors: {} });
  });

  it('maps 400 field errors through the field map', () => {
    const error = httpError(400, {
      vin: ['vehicle with this vin already exists.'],
      office_id: ['Invalid pk "99" - object does not exist.'],
    });

    expect(parseApiError(error, VEHICLE_FIELDS)).toEqual({
      message: null,
      fieldErrors: {
        vin: 'vehicle with this vin already exists.',
        office: 'Invalid pk "99" - object does not exist.',
      },
    });
  });

  it('puts non-field and unmapped 400 errors in the general message', () => {
    const error = httpError(400, {
      non_field_errors: ['Something is off.'],
      year: ['A valid integer is required.'],
    });

    expect(parseApiError(error, VEHICLE_FIELDS)).toEqual({
      message: 'Something is off. year: A valid integer is required.',
      fieldErrors: {},
    });
  });

  it('joins several messages for one field', () => {
    const error = httpError(400, { vin: ['First.', 'Second.'] });

    expect(parseApiError(error, VEHICLE_FIELDS).fieldErrors.vin).toBe('First. Second.');
  });

  it('falls back to a generic message for an empty 400 body', () => {
    expect(parseApiError(httpError(400, {})).message).toBe('The request is invalid.');
  });

  it('uses detail for other client errors', () => {
    expect(
      parseApiError(httpError(404, { detail: 'No Vehicle matches the given query.' })),
    ).toEqual({ message: 'No Vehicle matches the given query.', fieldErrors: {} });
    expect(parseApiError(httpError(409, { detail: 'Cannot delete.' })).message).toBe(
      'Cannot delete.',
    );
  });

  it('describes server errors without a JSON body', () => {
    expect(parseApiError(httpError(500, '<html>oops</html>')).message).toBe(
      'The server returned an error (500).',
    );
  });

  it('describes network errors', () => {
    const error = new AxiosError('Network Error', AxiosError.ERR_NETWORK);

    expect(parseApiError(error).message).toBe(
      'Cannot reach the API. Check that the backend is running.',
    );
  });

  it('uses a generic message for non-axios errors', () => {
    expect(parseApiError(new Error('boom')).message).toBe(
      'Something went wrong. Please try again.',
    );
  });
});

describe('getErrorStatus', () => {
  it('returns the HTTP status of an axios error', () => {
    expect(getErrorStatus(httpError(404, {}))).toBe(404);
  });

  it('returns undefined for anything else', () => {
    expect(getErrorStatus(new AxiosError('Network Error'))).toBeUndefined();
    expect(getErrorStatus(new Error('boom'))).toBeUndefined();
  });
});
