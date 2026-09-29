'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { officesApi } from '@/lib/api/offices';
import { getAllPages } from '@/lib/api/pagination';
import type { OfficeFilters } from '@/lib/api/types';
import { useInvalidateResources } from './use-invalidate-resources';

export function useOffices(filters: OfficeFilters = {}) {
  return useQuery({
    queryKey: ['offices', 'list', filters],
    queryFn: ({ signal }) => officesApi.list(filters, signal),
  });
}

export function useOfficeOptions() {
  return useQuery({
    queryKey: ['offices', 'options'],
    queryFn: ({ signal }) =>
      getAllPages((page, pageSignal) => officesApi.list({ page }, pageSignal), signal),
  });
}

export function useOfficeSummary() {
  return useQuery({
    queryKey: ['offices', 'summary'],
    queryFn: ({ signal }) => officesApi.summary(signal),
  });
}

export function useSaveOffice() {
  const invalidate = useInvalidateResources(['offices', 'vehicles']);
  return useMutation({ mutationFn: officesApi.save, onSuccess: invalidate });
}

export function useDeleteOffice() {
  const invalidate = useInvalidateResources(['offices', 'vehicles']);
  return useMutation({ mutationFn: officesApi.remove, onSuccess: invalidate });
}
