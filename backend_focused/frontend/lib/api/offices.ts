import { apiClient } from '@/lib/api-client';
import type {
  Office,
  OfficeFilters,
  OfficeInput,
  OfficePage,
  OfficeSummary,
  SaveInput,
} from './types';

export const officesApi = {
  async list(filters: OfficeFilters = {}, signal?: AbortSignal) {
    const { data } = await apiClient.get<OfficePage>('/offices/', { params: filters, signal });
    return data;
  },
  async detail(id: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<Office>(`/offices/${id}/`, { signal });
    return data;
  },
  async summary(signal?: AbortSignal) {
    const { data } = await apiClient.get<OfficeSummary[]>('/offices/summary/', { signal });
    return data;
  },
  async save({ id, data: input }: SaveInput<OfficeInput>) {
    const { data } = id
      ? await apiClient.put<Office>(`/offices/${id}/`, input)
      : await apiClient.post<Office>('/offices/', input);
    return data;
  },
  async remove(id: number) {
    await apiClient.delete(`/offices/${id}/`);
  },
};
