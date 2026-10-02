export type Office = {
  id: number;
  name: string;
  city: string;
};

export type Mechanic = {
  id: number;
  name: string;
  certification_number: string;
  is_active: boolean;
};

export type Vehicle = {
  id: number;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  office: Office;
  is_active: boolean;
  last_maintenance?: string | null;
};

export type MaintenanceRecord = {
  id: number;
  mechanic: Mechanic;
  maintenance_date: string;
  maintenance_type: string;
  cost: string;
  notes: string;
};

export type VehicleDetail = Vehicle & {
  maintenance_history: MaintenanceRecord[];
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type VehicleSearchParams = {
  office?: string;
  active?: string;
  make?: string;
  model?: string;
  maintained_from?: string;
  maintained_to?: string;
  mechanic_certification?: string;
  page?: string;
  page_size?: string;
};

export type VehicleWritePayload = {
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  office_id: number;
  is_active: boolean;
};

export type DuplicateCheckResult = {
  conflicts: Array<'vin' | 'license_plate'>;
};
