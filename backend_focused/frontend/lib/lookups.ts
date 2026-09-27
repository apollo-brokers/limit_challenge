import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { MaintenanceType, Mechanic, Office, Paginated } from '@/lib/types';

/** Load every item of a paginated collection by following it until the last page. */
async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page += 1) {
    const { data } = await apiClient.get<Paginated<T>>(path, { params: { page } });
    items.push(...data.results);
    if (!data.next) return items;
  }
}

// Offices, mechanics and maintenance types are not edited in this app, so they are fetched once.

/** All offices, for selects. */
export function useOffices() {
  return useQuery({
    queryKey: ['offices'],
    queryFn: () => fetchAllPages<Office>('/v1/offices/'),
    staleTime: Infinity,
  });
}

/** All mechanics, active and inactive, for selects. */
export function useMechanics() {
  return useQuery({
    queryKey: ['mechanics'],
    queryFn: () => fetchAllPages<Mechanic>('/v1/mechanics/'),
    staleTime: Infinity,
  });
}

/** All maintenance types, for selects. */
export function useMaintenanceTypes() {
  return useQuery({
    queryKey: ['maintenance-types'],
    queryFn: () => fetchAllPages<MaintenanceType>('/v1/maintenance-types/'),
    staleTime: Infinity,
  });
}
