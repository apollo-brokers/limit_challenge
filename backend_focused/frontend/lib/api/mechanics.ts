import { apiClient } from '@/lib/api-client';
import type {
  Mechanic,
  MechanicFilters,
  MechanicInput,
  MechanicPage,
  MechanicWorkload,
  SaveInput,
} from './types';

export const mechanicsApi = {
  async list(filters: MechanicFilters = {}, signal?: AbortSignal) {
    const { data } = await apiClient.get<MechanicPage>('/mechanics/', { params: filters, signal });
    return data;
  },
  async detail(id: number, signal?: AbortSignal) {
    const { data } = await apiClient.get<Mechanic>(`/mechanics/${id}/`, { signal });
    return data;
  },
  async workload(signal?: AbortSignal) {
    const { data } = await apiClient.get<MechanicWorkload[]>('/mechanics/workload/', { signal });
    return data;
  },
  async save({ id, data: input }: SaveInput<MechanicInput>) {
    const { data } = id
      ? await apiClient.put<Mechanic>(`/mechanics/${id}/`, input)
      : await apiClient.post<Mechanic>('/mechanics/', input);
    return data;
  },
  async remove(id: number) {
    await apiClient.delete(`/mechanics/${id}/`);
  },
};
