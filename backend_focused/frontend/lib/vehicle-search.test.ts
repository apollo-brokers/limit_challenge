import { describe, expect, it } from 'vitest';
import {
  EMPTY_FILTERS,
  hasActiveFilters,
  parseVehicleSearch,
  toSearchParams,
} from '@/lib/vehicle-search';

describe('parseVehicleSearch', () => {
  it('reads the filters and the page from the URL', () => {
    const search = parseVehicleSearch(
      new URLSearchParams(
        'office=2&active=true&make=Ford&model=Transit&maintained_from=2026-01-01' +
          '&maintained_to=2026-06-30&mechanic_certification=CERT-1&page=3',
      ),
    );

    expect(search).toEqual({
      filters: {
        office: '2',
        active: 'true',
        make: 'Ford',
        model: 'Transit',
        maintained_from: '2026-01-01',
        maintained_to: '2026-06-30',
        mechanic_certification: 'CERT-1',
      },
      page: 3,
    });
  });

  it('uses empty filters and page 1 for an empty URL', () => {
    expect(parseVehicleSearch(new URLSearchParams())).toEqual({
      filters: EMPTY_FILTERS,
      page: 1,
    });
  });

  it.each(['page=0', 'page=-2', 'page=abc', 'page=2.5', 'page='])(
    'falls back to page 1 for %s',
    (query) => {
      expect(parseVehicleSearch(new URLSearchParams(query)).page).toBe(1);
    },
  );

  it('ignores unknown parameters', () => {
    expect(parseVehicleSearch(new URLSearchParams('foo=bar')).filters).toEqual(EMPTY_FILTERS);
  });
});

describe('toSearchParams', () => {
  it('keeps only non-empty trimmed filters in a stable order', () => {
    const params = toSearchParams({
      filters: { ...EMPTY_FILTERS, model: ' Corolla ', office: '1', make: '   ' },
      page: 1,
    });

    expect(params.toString()).toBe('office=1&model=Corolla');
  });

  it('adds the page only after page 1', () => {
    expect(toSearchParams({ filters: EMPTY_FILTERS, page: 1 }).toString()).toBe('');
    expect(
      toSearchParams({ filters: { ...EMPTY_FILTERS, active: 'false' }, page: 2 }).toString(),
    ).toBe('active=false&page=2');
  });

  it('round-trips through the URL', () => {
    const search = {
      filters: { ...EMPTY_FILTERS, office: '3', maintained_from: '2026-01-01' },
      page: 4,
    };

    expect(parseVehicleSearch(toSearchParams(search))).toEqual(search);
  });
});

describe('hasActiveFilters', () => {
  it('is false for empty or blank filters', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, make: '  ' })).toBe(false);
  });

  it('is true when any filter has a value', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, mechanic_certification: 'CERT-1' })).toBe(true);
  });
});
