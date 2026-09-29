'use client';

import { useListFilters } from '@/hooks/use-list-filters';
import type { OfficeFilters } from '@/lib/api/types';

const defaults = { search: '' };

export type OfficeFilterValues = typeof defaults;

export function useOfficeFilters() {
  const state = useListFilters(defaults);
  const filters: OfficeFilters = {
    page: state.page,
    search: state.values.search || undefined,
  };

  return { ...state, filters };
}
