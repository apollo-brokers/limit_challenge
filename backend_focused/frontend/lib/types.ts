/** Page size of every paginated API collection (REST_FRAMEWORK PAGE_SIZE). */
export const PAGE_SIZE = 10;

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type Office = {
  id: number;
  name: string;
  city: string;
};

export type Vehicle = {
  id: number;
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
  active: boolean;
  office: Office;
};

/** Body for vehicle create and full update. Relations are sent as ids. */
export type VehicleWrite = {
  vin: string;
  license_plate: string;
  make: string;
  model: string;
  year: number | null;
  active: boolean;
  office_id: number | null;
};

export type Mechanic = {
  id: number;
  name: string;
  certification_number: string;
  active: boolean;
};

export type MaintenanceType = {
  id: number;
  name: string;
};

export type VehicleMaintenanceRecord = {
  id: number;
  performed_on: string;
  type: MaintenanceType;
  mechanic: Mechanic;
  cost: string;
  notes: string;
};

export type VehicleDetail = Vehicle & {
  maintenance_records: VehicleMaintenanceRecord[];
};

export type MaintenanceDueVehicle = Vehicle & {
  last_maintenance: string | null;
};

export type TokenPair = {
  access: string;
  refresh: string;
};

/** Body for creating a maintenance record. Relations are sent as ids, the cost as decimal text. */
export type MaintenanceRecordWrite = {
  vehicle_id: number;
  type_id: number | null;
  mechanic_id: number | null;
  performed_on: string;
  cost: string;
  notes: string;
};
