import { expect, test as base, type APIRequestContext, type Page } from '@playwright/test';
import type {
  MaintenanceInput,
  MaintenanceRecord,
  Mechanic,
  MechanicInput,
  Office,
  OfficeInput,
  Vehicle,
  VehicleInput,
} from '../lib/api/types';

export const apiURL = (process.env.E2E_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '');

type Records = {
  offices: Office;
  mechanics: Mechanic;
  vehicles: Vehicle;
  'maintenance-records': MaintenanceRecord;
};
type Inputs = {
  offices: OfficeInput;
  mechanics: MechanicInput;
  vehicles: VehicleInput;
  'maintenance-records': MaintenanceInput;
};
type Resource = keyof Records;

class TestRecords {
  readonly suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  private readonly created: Record<Resource, number[]> = {
    offices: [],
    mechanics: [],
    vehicles: [],
    'maintenance-records': [],
  };

  constructor(private readonly request: APIRequestContext) {}

  async create<T extends Resource>(resource: T, data: Inputs[T]): Promise<Records[T]> {
    const response = await this.request.post(`${apiURL}/${resource}/`, { data });
    expect(response.status(), await response.text()).toBe(201);
    const record = (await response.json()) as Records[T];
    this.created[resource].push(record.id);
    return record;
  }

  async createInUI<T extends Resource>(
    page: Page,
    resource: T,
    submit: () => Promise<void>,
  ): Promise<Records[T]> {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && response.url() === `${apiURL}/${resource}/`,
    );
    await submit();
    const response = await responsePromise;
    expect(response.status(), await response.text()).toBe(201);
    const record = (await response.json()) as Records[T];
    this.created[resource].push(record.id);
    return record;
  }

  async count(resource: Resource) {
    const response = await this.request.get(`${apiURL}/${resource}/`);
    expect(response.ok()).toBeTruthy();
    return ((await response.json()) as { count: number }).count;
  }

  async cleanup() {
    const failures: string[] = [];
    const order: Resource[] = ['maintenance-records', 'vehicles', 'mechanics', 'offices'];
    for (const resource of order) {
      for (const id of this.created[resource].toReversed()) {
        const response = await this.request.delete(`${apiURL}/${resource}/${id}/`);
        if (![204, 404].includes(response.status())) {
          failures.push(`${resource}/${id}: ${response.status()}`);
        }
      }
    }
    expect(failures, 'Only records created by this test are cleaned up, child-first.').toEqual([]);
  }
}

export const test = base.extend<{ records: TestRecords }>({
  records: async ({ request }, runFixture) => {
    const records = new TestRecords(request);
    try {
      await runFixture(records);
    } finally {
      await records.cleanup();
    }
  },
});

export { expect };
