'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { maintenanceApi } from '@/lib/api/maintenance';
import type { MaintenanceFilters } from '@/lib/api/types';
import { useInvalidateResources } from './use-invalidate-resources';

export function useMaintenanceRecords(filters: MaintenanceFilters = {}) {
  return useQuery({
    queryKey: ['maintenance', 'list', filters],
    queryFn: ({ signal }) => maintenanceApi.list(filters, signal),
  });
}

export function useSaveMaintenance() {
  const invalidate = useInvalidateResources(['maintenance', 'vehicles', 'offices', 'mechanics']);
  return useMutation({ mutationFn: maintenanceApi.save, onSuccess: invalidate });
}

export function useDeleteMaintenance() {
  const invalidate = useInvalidateResources(['maintenance', 'vehicles', 'offices', 'mechanics']);
  return useMutation({ mutationFn: maintenanceApi.remove, onSuccess: invalidate });
}
