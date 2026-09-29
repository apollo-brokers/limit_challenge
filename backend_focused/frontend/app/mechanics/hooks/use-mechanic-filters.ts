'use client';

import { useListFilters } from '@/hooks/use-list-filters';
import type { MechanicFilters } from '@/lib/api/types';

const defaults = { search: '', active: '' };

export type MechanicFilterValues = typeof defaults;

export function useMechanicFilters() {
  const state = useListFilters(defaults);
  const filters: MechanicFilters = {
    page: state.page,
    search: state.values.search || undefined,
    active:
      state.values.active === 'true' ? true : state.values.active === 'false' ? false : undefined,
  };

  return { ...state, filters };
}
