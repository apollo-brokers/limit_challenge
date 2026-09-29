'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { mechanicsApi } from '@/lib/api/mechanics';
import { getAllPages } from '@/lib/api/pagination';
import type { MechanicFilters } from '@/lib/api/types';
import { useInvalidateResources } from './use-invalidate-resources';

export function useMechanics(filters: MechanicFilters = {}) {
  return useQuery({
    queryKey: ['mechanics', 'list', filters],
    queryFn: ({ signal }) => mechanicsApi.list(filters, signal),
  });
}

export function useMechanicOptions() {
  return useQuery({
    queryKey: ['mechanics', 'options'],
    queryFn: ({ signal }) =>
      getAllPages((page, pageSignal) => mechanicsApi.list({ page }, pageSignal), signal),
  });
}

export function useMechanicWorkload() {
  return useQuery({
    queryKey: ['mechanics', 'workload'],
    queryFn: ({ signal }) => mechanicsApi.workload(signal),
  });
}

export function useSaveMechanic() {
  const invalidate = useInvalidateResources(['mechanics', 'vehicles', 'maintenance']);
  return useMutation({ mutationFn: mechanicsApi.save, onSuccess: invalidate });
}

export function useDeleteMechanic() {
  const invalidate = useInvalidateResources(['mechanics', 'vehicles', 'maintenance']);
  return useMutation({ mutationFn: mechanicsApi.remove, onSuccess: invalidate });
}
