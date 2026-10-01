import type { components, operations } from './schema';

export type Office = components['schemas']['Office'];
export type OfficeInput = components['schemas']['OfficeRequest'];
export type OfficeSummary = components['schemas']['OfficeSummary'];
export type Mechanic = components['schemas']['Mechanic'];
export type MechanicInput = components['schemas']['MechanicRequest'];
export type MechanicWorkload = components['schemas']['MechanicWorkload'];
export type Vehicle = components['schemas']['Vehicle'];
export type VehicleInput = components['schemas']['VehicleRequest'];
export type VehicleDetail = components['schemas']['VehicleDetail'];
export type VehicleNeedingMaintenance = components['schemas']['VehicleNeedingMaintenance'];
export type VehicleAssignmentInput = components['schemas']['VehicleAssignmentRequest'];
export type VehicleDuplicateInput = components['schemas']['VehicleDuplicateCheckRequest'];
export type VehicleDuplicateResult = components['schemas']['VehicleDuplicateCheckResult'];
export type MaintenanceRecord = components['schemas']['MaintenanceRecord'];
export type MaintenanceInput = components['schemas']['MaintenanceRecordRequest'];
export type OfficeFilters = NonNullable<operations['api_offices_list']['parameters']['query']>;
export type MechanicFilters = NonNullable<operations['api_mechanics_list']['parameters']['query']>;
export type MaintenanceFilters = NonNullable<
  operations['api_maintenance_records_list']['parameters']['query']
>;
export type VehicleFilters = NonNullable<operations['api_vehicles_list']['parameters']['query']>;

export type OfficePage = components['schemas']['PaginatedOfficeList'];
export type MechanicPage = components['schemas']['PaginatedMechanicList'];
export type VehiclePage = components['schemas']['PaginatedVehicleList'];
export type MaintenancePage = components['schemas']['PaginatedMaintenanceRecordList'];
export type VehicleNeedingMaintenancePage =
  components['schemas']['PaginatedVehicleNeedingMaintenanceList'];

export type SaveInput<T> = { id?: number; data: T };

// Preserve the server's pagination contract while sharing the all-pages loader.
export type Paginated<T> = Omit<OfficePage, 'results'> & { results: T[] };
