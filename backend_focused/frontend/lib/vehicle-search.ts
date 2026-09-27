/** Search filters, named exactly like the vehicle list query parameters of the API. */
export const VEHICLE_FILTER_KEYS = [
  'office',
  'active',
  'make',
  'model',
  'maintained_from',
  'maintained_to',
  'mechanic_certification',
] as const;

export type VehicleFilterKey = (typeof VEHICLE_FILTER_KEYS)[number];
export type VehicleFilters = Record<VehicleFilterKey, string>;
export type VehicleSearch = { filters: VehicleFilters; page: number };

export const EMPTY_FILTERS: VehicleFilters = {
  office: '',
  active: '',
  make: '',
  model: '',
  maintained_from: '',
  maintained_to: '',
  mechanic_certification: '',
};

/** Read a 1-based page number, falling back to 1 for anything that is not a positive integer. */
export function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/** Read the vehicle search state from URL query parameters. */
export function parseVehicleSearch(params: { get(name: string): string | null }): VehicleSearch {
  const filters = { ...EMPTY_FILTERS };
  for (const key of VEHICLE_FILTER_KEYS) {
    filters[key] = params.get(key) ?? '';
  }
  return { filters, page: parsePage(params.get('page')) };
}

/**
 * Build query parameters for both the page URL and the API request.
 *
 * Blank filters and page 1 are left out, so an empty search is a clean `/vehicles` URL.
 */
export function toSearchParams({ filters, page }: VehicleSearch): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of VEHICLE_FILTER_KEYS) {
    const value = filters[key].trim();
    if (value) params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  return params;
}

export function hasActiveFilters(filters: VehicleFilters): boolean {
  return VEHICLE_FILTER_KEYS.some((key) => filters[key].trim() !== '');
}
