import { mechanicsApi } from './mechanics';
import { officesApi } from './offices';
import type { Mechanic, Office, Vehicle } from './types';
import { vehiclesApi } from './vehicles';

export type AutocompleteOption = { id: string; label: string };

export type AutocompleteSource = {
  key: 'offices' | 'vehicles' | 'mechanics';
  search: (
    search: string,
    page: number,
    signal?: AbortSignal,
  ) => Promise<{ options: AutocompleteOption[]; nextPage: number | undefined }>;
  get: (id: string, signal?: AbortSignal) => Promise<AutocompleteOption>;
};

function officeOption(office: Office): AutocompleteOption {
  return { id: String(office.id), label: `${office.name} · ${office.city}` };
}

function vehicleOption(
  vehicle: Pick<Vehicle, 'id' | 'license_plate' | 'make' | 'model'>,
): AutocompleteOption {
  return {
    id: String(vehicle.id),
    label: `${vehicle.license_plate} · ${vehicle.make} ${vehicle.model}`,
  };
}

function mechanicOption(mechanic: Mechanic): AutocompleteOption {
  return {
    id: String(mechanic.id),
    label: `${mechanic.name} · ${mechanic.certification_number}`,
  };
}

export const officeAutocomplete: AutocompleteSource = {
  key: 'offices',
  async search(search, page, signal) {
    const result = await officesApi.list({ search: search || undefined, page }, signal);
    return {
      options: result.results.map(officeOption),
      nextPage: result.next ? page + 1 : undefined,
    };
  },
  async get(id, signal) {
    return officeOption(await officesApi.detail(Number(id), signal));
  },
};

export const vehicleAutocomplete: AutocompleteSource = {
  key: 'vehicles',
  async search(search, page, signal) {
    const result = await vehiclesApi.list({ search: search || undefined, page }, signal);
    return {
      options: result.results.map(vehicleOption),
      nextPage: result.next ? page + 1 : undefined,
    };
  },
  async get(id, signal) {
    return vehicleOption(await vehiclesApi.detail(Number(id), signal));
  },
};

export const mechanicAutocomplete: AutocompleteSource = {
  key: 'mechanics',
  async search(search, page, signal) {
    const result = await mechanicsApi.list({ search: search || undefined, page }, signal);
    return {
      options: result.results.map(mechanicOption),
      nextPage: result.next ? page + 1 : undefined,
    };
  },
  async get(id, signal) {
    return mechanicOption(await mechanicsApi.detail(Number(id), signal));
  },
};
