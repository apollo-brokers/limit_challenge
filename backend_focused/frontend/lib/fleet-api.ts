import { apiClient } from './api-client';
import type {
  DuplicateCheckResult,
  Office,
  Paginated,
  Vehicle,
  VehicleDetail,
  VehicleSearchParams,
  VehicleWritePayload,
} from './types';

function toQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, value);
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function listOffices(): Promise<Office[]> {
  const { data } = await apiClient.get<Paginated<Office> | Office[]>('/offices/', {
    params: { page_size: 100 },
  });
  return Array.isArray(data) ? data : data.results;
}

export async function searchVehicles(params: VehicleSearchParams): Promise<Paginated<Vehicle>> {
  const { data } = await apiClient.get<Paginated<Vehicle>>(`/vehicles/search/${toQuery(params)}`);
  return data;
}

export async function getVehicleDetails(id: number): Promise<VehicleDetail> {
  const { data } = await apiClient.get<VehicleDetail>(`/vehicles/${id}/details/`);
  return data;
}

export async function createVehicle(payload: VehicleWritePayload): Promise<Vehicle> {
  const { data } = await apiClient.post<Vehicle>('/vehicles/', payload);
  return data;
}

export async function updateVehicle(id: number, payload: VehicleWritePayload): Promise<Vehicle> {
  const { data } = await apiClient.put<Vehicle>(`/vehicles/${id}/`, payload);
  return data;
}

export async function deleteVehicle(id: number): Promise<void> {
  await apiClient.delete(`/vehicles/${id}/`);
}

export async function assignVehicle(id: number, officeId: number): Promise<Vehicle> {
  const { data } = await apiClient.post<Vehicle>(`/vehicles/${id}/assign/`, {
    office_id: officeId,
  });
  return data;
}

export async function vehiclesNeedingMaintenance(page = '1'): Promise<Paginated<Vehicle>> {
  const { data } = await apiClient.get<Paginated<Vehicle>>(
    `/vehicles/needing-maintenance/${toQuery({ page, page_size: '20' })}`,
  );
  return data;
}

export async function duplicateCheck(payload: {
  vin: string;
  license_plate: string;
  exclude_id?: number;
  is_active?: boolean;
}): Promise<DuplicateCheckResult> {
  const { data } = await apiClient.post<DuplicateCheckResult>(
    '/vehicles/duplicate-check/',
    payload,
  );
  return data;
}

export function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const response = (error as { response?: { data?: unknown; status?: number } }).response;
    const data = response?.data;
    if (typeof data === 'string') return data;
    if (data && typeof data === 'object') {
      const entries = Object.entries(data as Record<string, unknown>);
      if (entries.length) {
        return entries
          .map(([key, value]) => {
            const message = Array.isArray(value) ? value.join(', ') : String(value);
            return key === 'detail' ? message : `${key}: ${message}`;
          })
          .join(' · ');
      }
    }
    if (response?.status) return `Request failed (${response.status})`;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}
