'use client';

import { useMemo } from 'react';
import { QueryKey, useQuery, keepPreviousData } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import {
  PaginatedResponse,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListItem,
} from '@/lib/types';

const SUBMISSIONS_QUERY_KEY = 'submissions';

async function fetchSubmissions(filters: SubmissionListFilters) {
  const response = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
    params: {
      status: filters.status,
      brokerId: filters.brokerId,
      companySearch: filters.companySearch,
      created_from: filters.createdFrom,
      created_to: filters.createdTo,
      hasDocuments: filters.hasDocuments,
      hasNotes: filters.hasNotes,
      page: filters.page || 1,
    },
  });
  return response.data;
}

async function fetchSubmissionDetail(id: string | number) {
  if (!id) {
    throw new Error('Submission id is required');
  }

  const response = await apiClient.get<SubmissionDetail>(`/submissions/${id}/`);
  return response.data;
}

/**
 * Hook to retrieve a paginated list of submissions adhering to the given Active Filters.
 * Defaults to disabled unless actively called, caching aggressively.
 */
export function useSubmissionsList(filters: SubmissionListFilters) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, filters] as QueryKey,
    queryFn: () => fetchSubmissions(filters),
    placeholderData: keepPreviousData, // Ensures smooth UI transition on pagination without flashes
  });
}

/**
 * Hook to retrieve the deep comprehensive Detail context for a specified submission ID.
 * Refetch interval is constrained since historical notes/docs change less frequently.
 */
export function useSubmissionDetail(id: string | number) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, id],
    queryFn: () => fetchSubmissionDetail(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useSubmissionQueryKey(filters: SubmissionListFilters) {
  return useMemo(() => [SUBMISSIONS_QUERY_KEY, filters] as QueryKey, [filters]);
}
