/** Generated from the backend OpenAPI schema. Run npm run generate:api; do not edit. */
export interface paths {
  '/api/maintenance-records/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_maintenance_records_list'];
    put?: never;
    post: operations['api_maintenance_records_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/maintenance-records/{id}/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_maintenance_records_retrieve'];
    put: operations['api_maintenance_records_update'];
    post?: never;
    delete: operations['api_maintenance_records_destroy'];
    options?: never;
    head?: never;
    patch: operations['api_maintenance_records_partial_update'];
    trace?: never;
  };
  '/api/mechanics/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_mechanics_list'];
    put?: never;
    post: operations['api_mechanics_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/mechanics/{id}/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_mechanics_retrieve'];
    put: operations['api_mechanics_update'];
    post?: never;
    delete: operations['api_mechanics_destroy'];
    options?: never;
    head?: never;
    patch: operations['api_mechanics_partial_update'];
    trace?: never;
  };
  '/api/mechanics/workload/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_mechanics_workload_list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/offices/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_offices_list'];
    put?: never;
    post: operations['api_offices_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/offices/{id}/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_offices_retrieve'];
    put: operations['api_offices_update'];
    post?: never;
    delete: operations['api_offices_destroy'];
    options?: never;
    head?: never;
    patch: operations['api_offices_partial_update'];
    trace?: never;
  };
  '/api/offices/summary/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_offices_summary_list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/vehicles/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_vehicles_list'];
    put?: never;
    post: operations['api_vehicles_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/vehicles/{id}/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_vehicles_retrieve'];
    put: operations['api_vehicles_update'];
    post?: never;
    delete: operations['api_vehicles_destroy'];
    options?: never;
    head?: never;
    patch: operations['api_vehicles_partial_update'];
    trace?: never;
  };
  '/api/vehicles/{id}/assign-office/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['api_vehicles_assign_office_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/vehicles/{id}/maintenance-history/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_vehicles_maintenance_history_list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/vehicles/duplicate-check/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post: operations['api_vehicles_duplicate_check_create'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/vehicles/needing-maintenance/': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get: operations['api_vehicles_needing_maintenance_list'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    MaintenanceRecord: {
      readonly id: number;
      /** Format: date */
      maintenance_date: string;
      maintenance_type: string;
      /** Format: decimal */
      cost: string;
      notes?: string;
      /** Format: date-time */
      readonly created_at: string;
      /** Format: date-time */
      readonly updated_at: string;
      vehicle: number;
      mechanic: number;
    };
    MaintenanceRecordDetail: {
      readonly id: number;
      readonly mechanic: components['schemas']['Mechanic'];
      /** Format: date */
      maintenance_date: string;
      maintenance_type: string;
      /** Format: decimal */
      cost: string;
      notes?: string;
      /** Format: date-time */
      readonly created_at: string;
      /** Format: date-time */
      readonly updated_at: string;
      vehicle: number;
    };
    MaintenanceRecordRequest: {
      /** Format: date */
      maintenance_date: string;
      maintenance_type: string;
      /** Format: decimal */
      cost: string;
      notes?: string;
      vehicle: number;
      mechanic: number;
    };
    Mechanic: {
      readonly id: number;
      name: string;
      certification_number: string;
      active?: boolean;
      /** Format: date-time */
      readonly created_at: string;
      /** Format: date-time */
      readonly updated_at: string;
    };
    MechanicRequest: {
      name: string;
      certification_number: string;
      active?: boolean;
    };
    MechanicWorkload: {
      name: string;
      maintenance_count: number;
      /** Format: decimal */
      total_maintenance_cost: string;
    };
    Office: {
      readonly id: number;
      name: string;
      city: string;
      /** Format: date-time */
      readonly created_at: string;
      /** Format: date-time */
      readonly updated_at: string;
    };
    OfficeRequest: {
      name: string;
      city: string;
    };
    OfficeSummary: {
      name: string;
      city: string;
      active_vehicle_count: number;
      /** Format: decimal */
      maintenance_cost_last_year: string;
      /** Format: date */
      last_maintenance: string | null;
    };
    PaginatedMaintenanceRecordList: {
      /** @example 123 */
      count: number;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=4
       */
      next?: string | null;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=2
       */
      previous?: string | null;
      results: components['schemas']['MaintenanceRecord'][];
    };
    PaginatedMechanicList: {
      /** @example 123 */
      count: number;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=4
       */
      next?: string | null;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=2
       */
      previous?: string | null;
      results: components['schemas']['Mechanic'][];
    };
    PaginatedOfficeList: {
      /** @example 123 */
      count: number;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=4
       */
      next?: string | null;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=2
       */
      previous?: string | null;
      results: components['schemas']['Office'][];
    };
    PaginatedVehicleList: {
      /** @example 123 */
      count: number;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=4
       */
      next?: string | null;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=2
       */
      previous?: string | null;
      results: components['schemas']['Vehicle'][];
    };
    PaginatedVehicleNeedingMaintenanceList: {
      /** @example 123 */
      count: number;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=4
       */
      next?: string | null;
      /**
       * Format: uri
       * @example http://api.example.org/accounts/?page=2
       */
      previous?: string | null;
      results: components['schemas']['VehicleNeedingMaintenance'][];
    };
    PatchedMaintenanceRecordRequest: {
      /** Format: date */
      maintenance_date?: string;
      maintenance_type?: string;
      /** Format: decimal */
      cost?: string;
      notes?: string;
      vehicle?: number;
      mechanic?: number;
    };
    PatchedMechanicRequest: {
      name?: string;
      certification_number?: string;
      active?: boolean;
    };
    PatchedOfficeRequest: {
      name?: string;
      city?: string;
    };
    PatchedVehicleRequest: {
      vin?: string;
      license_plate?: string;
      make?: string;
      model?: string;
      /** Format: int64 */
      year?: number;
      active?: boolean;
      office?: number;
    };
    Vehicle: {
      readonly id: number;
      vin: string;
      license_plate: string;
      make: string;
      model: string;
      /** Format: int64 */
      year: number;
      active?: boolean;
      /** Format: date-time */
      readonly created_at: string;
      /** Format: date-time */
      readonly updated_at: string;
      office: number;
    };
    VehicleAssignmentRequest: {
      office: number;
    };
    VehicleDetail: {
      readonly id: number;
      readonly office: components['schemas']['Office'];
      readonly maintenance_records: components['schemas']['MaintenanceRecordDetail'][];
      vin: string;
      license_plate: string;
      make: string;
      model: string;
      /** Format: int64 */
      year: number;
      active?: boolean;
      /** Format: date-time */
      readonly created_at: string;
      /** Format: date-time */
      readonly updated_at: string;
    };
    VehicleDuplicateCheckRequest: {
      vin: string;
      license_plate: string;
    };
    VehicleDuplicateCheckResult: {
      conflicts: string[];
    };
    VehicleNeedingMaintenance: {
      readonly id: number;
      /** Format: date */
      last_maintenance: string | null;
      vin: string;
      license_plate: string;
      make: string;
      model: string;
      /** Format: int64 */
      year: number;
      active?: boolean;
      /** Format: date-time */
      readonly created_at: string;
      /** Format: date-time */
      readonly updated_at: string;
      office: number;
    };
    VehicleRequest: {
      vin: string;
      license_plate: string;
      make: string;
      model: string;
      /** Format: int64 */
      year: number;
      active?: boolean;
      office: number;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  api_maintenance_records_list: {
    parameters: {
      query?: {
        maintenance_date_after?: string;
        maintenance_date_before?: string;
        mechanic?: number;
        /** @description A page number within the paginated result set. */
        page?: number;
        /** @description A search term. */
        search?: string;
        vehicle?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PaginatedMaintenanceRecordList'];
        };
      };
    };
  };
  api_maintenance_records_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MaintenanceRecordRequest'];
        'application/x-www-form-urlencoded': components['schemas']['MaintenanceRecordRequest'];
        'multipart/form-data': components['schemas']['MaintenanceRecordRequest'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MaintenanceRecord'];
        };
      };
    };
  };
  api_maintenance_records_retrieve: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this maintenance record. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MaintenanceRecord'];
        };
      };
    };
  };
  api_maintenance_records_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this maintenance record. */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MaintenanceRecordRequest'];
        'application/x-www-form-urlencoded': components['schemas']['MaintenanceRecordRequest'];
        'multipart/form-data': components['schemas']['MaintenanceRecordRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MaintenanceRecord'];
        };
      };
    };
  };
  api_maintenance_records_destroy: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this maintenance record. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No response body */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  api_maintenance_records_partial_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this maintenance record. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['PatchedMaintenanceRecordRequest'];
        'application/x-www-form-urlencoded': components['schemas']['PatchedMaintenanceRecordRequest'];
        'multipart/form-data': components['schemas']['PatchedMaintenanceRecordRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MaintenanceRecord'];
        };
      };
    };
  };
  api_mechanics_list: {
    parameters: {
      query?: {
        active?: boolean;
        /** @description A page number within the paginated result set. */
        page?: number;
        /** @description A search term. */
        search?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PaginatedMechanicList'];
        };
      };
    };
  };
  api_mechanics_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MechanicRequest'];
        'application/x-www-form-urlencoded': components['schemas']['MechanicRequest'];
        'multipart/form-data': components['schemas']['MechanicRequest'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Mechanic'];
        };
      };
    };
  };
  api_mechanics_retrieve: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this mechanic. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Mechanic'];
        };
      };
    };
  };
  api_mechanics_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this mechanic. */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['MechanicRequest'];
        'application/x-www-form-urlencoded': components['schemas']['MechanicRequest'];
        'multipart/form-data': components['schemas']['MechanicRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Mechanic'];
        };
      };
    };
  };
  api_mechanics_destroy: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this mechanic. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No response body */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  api_mechanics_partial_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this mechanic. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['PatchedMechanicRequest'];
        'application/x-www-form-urlencoded': components['schemas']['PatchedMechanicRequest'];
        'multipart/form-data': components['schemas']['PatchedMechanicRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Mechanic'];
        };
      };
    };
  };
  api_mechanics_workload_list: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['MechanicWorkload'][];
        };
      };
    };
  };
  api_offices_list: {
    parameters: {
      query?: {
        /** @description A page number within the paginated result set. */
        page?: number;
        /** @description A search term. */
        search?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PaginatedOfficeList'];
        };
      };
    };
  };
  api_offices_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OfficeRequest'];
        'application/x-www-form-urlencoded': components['schemas']['OfficeRequest'];
        'multipart/form-data': components['schemas']['OfficeRequest'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Office'];
        };
      };
    };
  };
  api_offices_retrieve: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this office. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Office'];
        };
      };
    };
  };
  api_offices_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this office. */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['OfficeRequest'];
        'application/x-www-form-urlencoded': components['schemas']['OfficeRequest'];
        'multipart/form-data': components['schemas']['OfficeRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Office'];
        };
      };
    };
  };
  api_offices_destroy: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this office. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No response body */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  api_offices_partial_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this office. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['PatchedOfficeRequest'];
        'application/x-www-form-urlencoded': components['schemas']['PatchedOfficeRequest'];
        'multipart/form-data': components['schemas']['PatchedOfficeRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Office'];
        };
      };
    };
  };
  api_offices_summary_list: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['OfficeSummary'][];
        };
      };
    };
  };
  api_vehicles_list: {
    parameters: {
      query?: {
        active?: boolean;
        maintenance_date_after?: string;
        maintenance_date_before?: string;
        make?: string;
        mechanic_certification_number?: string;
        model?: string;
        office?: number;
        /** @description A page number within the paginated result set. */
        page?: number;
        /** @description A search term. */
        search?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PaginatedVehicleList'];
        };
      };
    };
  };
  api_vehicles_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['VehicleRequest'];
        'application/x-www-form-urlencoded': components['schemas']['VehicleRequest'];
        'multipart/form-data': components['schemas']['VehicleRequest'];
      };
    };
    responses: {
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Vehicle'];
        };
      };
    };
  };
  api_vehicles_retrieve: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this vehicle. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VehicleDetail'];
        };
      };
    };
  };
  api_vehicles_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this vehicle. */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['VehicleRequest'];
        'application/x-www-form-urlencoded': components['schemas']['VehicleRequest'];
        'multipart/form-data': components['schemas']['VehicleRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Vehicle'];
        };
      };
    };
  };
  api_vehicles_destroy: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this vehicle. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description No response body */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
    };
  };
  api_vehicles_partial_update: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this vehicle. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: {
      content: {
        'application/json': components['schemas']['PatchedVehicleRequest'];
        'application/x-www-form-urlencoded': components['schemas']['PatchedVehicleRequest'];
        'multipart/form-data': components['schemas']['PatchedVehicleRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Vehicle'];
        };
      };
    };
  };
  api_vehicles_assign_office_create: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description A unique integer value identifying this vehicle. */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['VehicleAssignmentRequest'];
        'application/x-www-form-urlencoded': components['schemas']['VehicleAssignmentRequest'];
        'multipart/form-data': components['schemas']['VehicleAssignmentRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['Vehicle'];
        };
      };
    };
  };
  api_vehicles_maintenance_history_list: {
    parameters: {
      query?: {
        /** @description A page number within the paginated result set. */
        page?: number;
      };
      header?: never;
      path: {
        /** @description A unique integer value identifying this vehicle. */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PaginatedMaintenanceRecordList'];
        };
      };
    };
  };
  api_vehicles_duplicate_check_create: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['VehicleDuplicateCheckRequest'];
        'application/x-www-form-urlencoded': components['schemas']['VehicleDuplicateCheckRequest'];
        'multipart/form-data': components['schemas']['VehicleDuplicateCheckRequest'];
      };
    };
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['VehicleDuplicateCheckResult'];
        };
      };
    };
  };
  api_vehicles_needing_maintenance_list: {
    parameters: {
      query?: {
        /** @description A page number within the paginated result set. */
        page?: number;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          'application/json': components['schemas']['PaginatedVehicleNeedingMaintenanceList'];
        };
      };
    };
  };
}
