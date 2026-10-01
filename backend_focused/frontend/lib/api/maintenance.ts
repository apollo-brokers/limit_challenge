import { apiClient } from '@/lib/api-client';
import type {
  MaintenanceFilters,
  MaintenanceInput,
  MaintenancePage,
  MaintenanceRecord,
  SaveInput,
} from './types';

export const maintenanceApi = {
  async list(filters: MaintenanceFilters = {}, signal?: AbortSignal) {
    const { data } = await apiClient.get<MaintenancePage>('/maintenance-records/', {
      params: filters,
      signal,
    });
    return data;
  },
  async save({ id, data: input }: SaveInput<MaintenanceInput>) {
    const { data } = id
      ? await apiClient.put<MaintenanceRecord>(`/maintenance-records/${id}/`, input)
      : await apiClient.post<MaintenanceRecord>('/maintenance-records/', input);
    return data;
  },
  async remove(id: number) {
    await apiClient.delete(`/maintenance-records/${id}/`);
  },
};
