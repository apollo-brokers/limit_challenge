import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  MaintenanceType,
  Mechanic,
  Office,
  Paginated,
  VehicleMake,
  VehicleModel,
} from '@/lib/types';

/** Load every item of a paginated collection by following it until the last page. */
async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page += 1) {
    const { data } = await apiClient.get<Paginated<T>>(path, { params: { page } });
    items.push(...data.results);
    if (!data.next) return items;
  }
}

// Offices, vehicle makes and models, mechanics and maintenance types are not edited in this app,
// so they are fetched once.

/** All offices, for selects. */
export function useOffices() {
  return useQuery({
    queryKey: ['offices'],
    queryFn: () => fetchAllPages<Office>('/v1/offices/'),
    staleTime: Infinity,
  });
}

/** All mechanics, active and inactive, for selects. */
export function useMechanics() {
  return useQuery({
    queryKey: ['mechanics'],
    queryFn: () => fetchAllPages<Mechanic>('/v1/mechanics/'),
    staleTime: Infinity,
  });
}

/** All maintenance types, for selects. */
export function useMaintenanceTypes() {
  return useQuery({
    queryKey: ['maintenance-types'],
    queryFn: () => fetchAllPages<MaintenanceType>('/v1/maintenance-types/'),
    staleTime: Infinity,
  });
}

/** All vehicle makes, for selects. */
export function useVehicleMakes() {
  return useQuery({
    queryKey: ['vehicle-makes'],
    queryFn: () => fetchAllPages<VehicleMake>('/v1/vehicle-makes/'),
    staleTime: Infinity,
  });
}

/** All vehicle models with their make, for selects. */
export function useVehicleModels() {
  return useQuery({
    queryKey: ['vehicle-models'],
    queryFn: () => fetchAllPages<VehicleModel>('/v1/vehicle-models/'),
    staleTime: Infinity,
  });
}

/** Models of the make with this id (as a form value), or every model when no make is chosen. */
export function modelsOfMake(models: VehicleModel[], makeId: string): VehicleModel[] {
  return makeId === '' ? models : models.filter((model) => String(model.make.id) === makeId);
}

/** "Ford · Transit", for lists that mix models of several makes. */
export function vehicleModelLabel(model: VehicleModel): string {
  return `${model.make.name} · ${model.name}`;
}
