'use client';

import { QueryKey, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import {
  PaginatedResponse,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListItem,
} from '@/lib/types';

const SUBMISSIONS_QUERY_KEY = 'submissions';

function cleanParams(filters: SubmissionListFilters) {
  const params: Record<string, string | number> = {};

  if (filters.status) params.status = filters.status;
  if (filters.brokerId) params.brokerId = filters.brokerId;
  if (filters.companySearch) params.companySearch = filters.companySearch;
  if (filters.priority) params.priority = filters.priority;
  if (filters.createdFrom) params.createdFrom = filters.createdFrom;
  if (filters.createdTo) params.createdTo = filters.createdTo;
  if (filters.page && filters.page > 1) params.page = filters.page;

  return params;
}

async function fetchSubmissions(filters: SubmissionListFilters) {
  const response = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
    params: cleanParams(filters),
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

export function useSubmissionsList(filters: SubmissionListFilters) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, 'list', filters] as QueryKey,
    queryFn: () => fetchSubmissions(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useSubmissionDetail(id: string | number) {
  return useQuery({
    queryKey: [SUBMISSIONS_QUERY_KEY, 'detail', id],
    queryFn: () => fetchSubmissionDetail(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  });
}
