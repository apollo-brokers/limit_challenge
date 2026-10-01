'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { getAllPages } from '@/lib/api/pagination';
import { vehiclesApi } from '@/lib/api/vehicles';
import type { VehicleFilters } from '@/lib/api/types';
import { useInvalidateResources } from './use-invalidate-resources';

export function useVehicles(filters: VehicleFilters = {}) {
  return useQuery({
    queryKey: ['vehicles', 'list', filters],
    queryFn: ({ signal }) => vehiclesApi.list(filters, signal),
  });
}

export function useVehicle(id: number) {
  return useQuery({
    queryKey: ['vehicles', 'detail', id],
    queryFn: ({ signal }) => vehiclesApi.detail(id, signal),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useVehicleOptions() {
  return useQuery({
    queryKey: ['vehicles', 'options'],
    queryFn: ({ signal }) =>
      getAllPages((page, signal) => vehiclesApi.list({ page }, signal), signal),
  });
}

export function useVehiclesNeedingMaintenance(page = 1) {
  return useQuery({
    queryKey: ['vehicles', 'needing-maintenance', page],
    queryFn: ({ signal }) => vehiclesApi.needingMaintenance(page, signal),
  });
}

export function useVehicleMaintenanceHistory(id: number, page = 1) {
  return useQuery({
    queryKey: ['vehicles', 'maintenance-history', id, page],
    queryFn: ({ signal }) => vehiclesApi.maintenanceHistory(id, page, signal),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useSaveVehicle() {
  const invalidate = useInvalidateResources(['vehicles', 'offices', 'maintenance']);
  return useMutation({ mutationFn: vehiclesApi.save, onSuccess: invalidate });
}

export function useDeleteVehicle() {
  const invalidate = useInvalidateResources(['vehicles', 'offices', 'maintenance']);
  return useMutation({ mutationFn: vehiclesApi.remove, onSuccess: invalidate });
}

export function useAssignOffice() {
  const invalidate = useInvalidateResources(['vehicles', 'offices']);
  return useMutation({ mutationFn: vehiclesApi.assignOffice, onSuccess: invalidate });
}

export function useVehicleDuplicateCheck() {
  return useMutation({ mutationFn: vehiclesApi.duplicateCheck });
}
